# ===============================
# 🐘 Laravel 12.x on PHP 8.2 for Render
# ===============================

# Base image with Apache
FROM php:8.2-apache

# Install required extensions and tools
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libzip-dev sqlite3 libsqlite3-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Copy all Laravel source code into container
COPY . .

# Copy composer from official image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Generate Laravel key
RUN php artisan key:generate

# Expose Render port
EXPOSE 10000

# Start Laravel
CMD php artisan serve --host=0.0.0.0 --port=10000
