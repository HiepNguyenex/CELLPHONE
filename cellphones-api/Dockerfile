# ===============================
# 🐘 Laravel 12.x on PHP 8.2 for Render (SQLite Ready)
# ===============================

FROM php:8.2-apache

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libzip-dev sqlite3 libsqlite3-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_sqlite mbstring exif pcntl bcmath gd zip

# Enable Apache mod_rewrite (for Laravel routing)
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Copy composer binary from official composer image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy application source code (current directory)
COPY . .

# Create SQLite database file (avoids “unable to open database” error)
RUN mkdir -p database && touch database/database.sqlite

# Install PHP dependencies (without dev packages)
RUN composer install --no-dev --optimize-autoloader

# Generate Laravel app key and cache config/routes/views
RUN php artisan key:generate \
 && php artisan config:cache \
 && php artisan route:cache \
 && php artisan view:cache

# Expose Render port
EXPOSE 10000

# Start Laravel development server
CMD php artisan serve --host=0.0.0.0 --port=10000
