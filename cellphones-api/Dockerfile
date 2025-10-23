# ===============================================
# 🐘 Laravel 12.x - Optimized for Render Hosting
# ===============================================
FROM php:8.2-apache

# 1️⃣ Install PHP extensions
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libzip-dev sqlite3 libsqlite3-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_sqlite mbstring exif pcntl bcmath gd zip \
    && a2enmod rewrite

# 2️⃣ Working directory
WORKDIR /var/www/html

# 3️⃣ Copy Composer binary
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# 4️⃣ Copy project files
COPY . .

# 5️⃣ Install dependencies
RUN composer clear-cache \
 && composer install --no-dev --no-scripts --prefer-dist --optimize-autoloader \
 && composer dump-autoload -o

# 6️⃣ Prepare SQLite database (fix permission)
RUN mkdir -p database && touch database/database.sqlite && chmod 777 database/database.sqlite

# 7️⃣ Copy .env if missing
RUN if [ ! -f ".env" ]; then cp .env.example .env; fi \
 && echo "✅ Copied .env.example → .env"

# 8️⃣ Generate key & cache configs safely
RUN php artisan key:generate || true \
 && php artisan config:clear && php artisan cache:clear && php artisan route:clear && php artisan view:clear \
 && php artisan migrate --force || true \
 && php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan optimize:clear

# 9️⃣ Expose port
EXPOSE 10000

# 🔟 Start Laravel server
CMD php artisan serve --host=0.0.0.0 --port=10000
