# ===============================================
# 🐘 Laravel 12.x - Auto migrate & seed + Render port fix + Public root
# ===============================================
FROM php:8.2-apache

# 1️⃣ Install PHP extensions
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libzip-dev sqlite3 libsqlite3-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_sqlite mbstring exif pcntl bcmath gd zip \
    && a2enmod rewrite

# 2️⃣ Working directory (Laravel public)
WORKDIR /var/www/html

# 3️⃣ Copy Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# 4️⃣ Copy project files
COPY . .

# 5️⃣ Install dependencies
RUN composer install --no-dev --no-scripts --prefer-dist --optimize-autoloader \
 && composer dump-autoload -o

# 6️⃣ Prepare SQLite
RUN mkdir -p database && touch database/database.sqlite && chmod 777 database/database.sqlite

# 7️⃣ Copy .env if missing
RUN if [ ! -f ".env" ]; then cp .env.example .env; fi \
 && echo "✅ Copied .env.example → .env"

# 8️⃣ Laravel setup & cache
RUN php artisan key:generate || true \
 && php artisan config:clear && php artisan cache:clear && php artisan route:clear && php artisan view:clear \
 && php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan optimize:clear

# ✅ Chỉ định Apache phục vụ thư mục public
RUN sed -i 's|/var/www/html|/var/www/html/public|g' /etc/apache2/sites-available/000-default.conf

# 9️⃣ Expose Render port
EXPOSE 10000

# ✅ Force Apache to listen on Render's expected port
ENV PORT=10000
RUN sed -i "s/80/${PORT}/g" /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf

# 🔟 Auto migrate + seed on startup
CMD php artisan migrate:fresh --seed --force && apache2-foreground

# 🩺 Healthcheck
HEALTHCHECK CMD curl -f http://localhost:10000/api/v1/products || exit 1
