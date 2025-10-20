# ===============================
# 🐘 Laravel 12.x on PHP 8.2 for Render (Stable)
# ===============================

# Base image with Apache (for better stability)
FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libzip-dev sqlite3 libsqlite3-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip

# Enable Apache mod_rewrite (important for Laravel routing)
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Copy composer from official image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy Laravel source code into the container
COPY . .

# Install PHP dependencies (production only)
RUN composer install --no-dev --optimize-autoloader

# Generate Laravel APP_KEY & optimize caches
RUN php artisan key:generate \
 && php artisan config:cache \
 && php artisan route:cache \
 && php artisan view:cache

# Expose Render port (Render routes traffic through 10000)
EXPOSE 10000

# Start Laravel app
CMD php artisan serve --host=0.0.0.0 --port=10000
