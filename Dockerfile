# =============================================================
# Stage 1: Build frontend assets (Node.js)
# =============================================================
FROM node:20-alpine AS frontend

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY resources/ resources/
COPY vite.config.ts tsconfig.json ./
COPY public/ public/

RUN npm run build

# =============================================================
# Stage 2: Production PHP-FPM image
# =============================================================
FROM php:8.4-fpm-alpine AS app

# Install system dependencies + PHP extensions
RUN apk add --no-cache \
        libpng-dev \
        libjpeg-turbo-dev \
        freetype-dev \
        libzip-dev \
        libxml2-dev \
        oniguruma-dev \
        postgresql-dev \
        supervisor \
        nginx \
        curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pgsql \
        gd \
        mbstring \
        xml \
        zip \
        bcmath \
        pcntl \
        opcache

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install PHP dependencies (production only)
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Copy application source
COPY . .

# Copy built frontend assets from stage 1
COPY --from=frontend /app/public/build public/build

# Set correct permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Copy config files
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
