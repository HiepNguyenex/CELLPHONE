# ===============================
# 🐘 Laravel 12.x on PHP 8.2 - Optimized for Render
# ===============================

FROM php:8.2-apache

# ===============================
# 1️⃣ Install dependencies & PHP extensions
# ===============================
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libzip-dev sqlite3 libsqlite3-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_sqlite mbstring exif pcntl bcmath gd zip \
    && a2enmod rewrite

# ===============================
# 2️⃣ Set working directory
# ===============================
WORKDIR /var/www/html

# ===============================
# 3️⃣ Copy Composer binary
# ===============================
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# ===============================
# 4️⃣ Copy Laravel project files
# ===============================
COPY . .

# ===============================
# 5️⃣ Force clean Composer cache & rebuild dependencies
# ===============================
RUN composer clear-cache \
 && rm -rf vendor composer.lock \
 && composer install --no-dev --no-scripts --prefer-dist --optimize-autoloader \
 && composer dump-autoload --optimize

# ===============================
# 6️⃣ Prepare SQLite database file (avoid “unable to open database” error)
# ===============================
RUN mkdir -p database && touch database/database.sqlite

# ===============================
# 7️⃣ Copy .env.example → .env (fix: missing .env on Render)
# ===============================
RUN if [ ! -f ".env" ]; then cp .env.example .env; fi \
 && echo "✅ Copied .env.example → .env"

# ===============================
# 8️⃣ Generate key & cache Laravel config/routes/views
# ===============================
RUN php artisan key:generate \
 && php artisan config:clear \
 && php artisan config:cache \
 && php artisan route:cache \
 && php artisan view:cache \
 && php artisan optimize:clear

# ===============================
# 9️⃣ Expose port for Render
# ===============================
EXPOSE 10000

# ===============================
# 🔟 Start Laravel server
# ===============================
CMD php artisan serve --host=0.0.0.0 --port=10000
