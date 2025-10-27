# ===============================================
# 🐘 Laravel 12.x - Render Optimized Dockerfile
# ===============================================
FROM php:8.2-apache

# 1️⃣ Install PHP extensions
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libzip-dev sqlite3 libsqlite3-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_sqlite mbstring exif pcntl bcmath gd zip \
    && a2enmod rewrite

# ⚙️ Fix Apache ServerName warning (AH00558)
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# 2️⃣ Set working directory
WORKDIR /var/www/html

# 3️⃣ Copy composer files first (for layer caching)
COPY composer.json composer.lock ./

# 4️⃣ Install composer dependencies (cached layer)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --prefer-dist --optimize-autoloader \
 && composer dump-autoload -o

# 5️⃣ Copy project files
COPY . .

# 6️⃣ Prepare SQLite
RUN mkdir -p database && touch database/database.sqlite && chmod 777 database/database.sqlite

# 7️⃣ Copy .env if missing
RUN if [ ! -f ".env" ]; then cp .env.example .env; fi

# 8️⃣ Generate key & cache config
RUN php artisan key:generate || true \
 && php artisan config:clear && php artisan cache:clear && php artisan route:clear && php artisan view:clear \
 && php artisan config:cache && php artisan route:cache && php artisan view:cache

# ✅ Apache serve /public
RUN sed -i 's|/var/www/html|/var/www/html/public|g' /etc/apache2/sites-available/000-default.conf

# 9️⃣ Render port
EXPOSE 10000
ENV PORT=10000
RUN sed -i "s/80/${PORT}/g" /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf

# 🔟 Auto migrate + seed at startup
CMD php artisan migrate:fresh --seed --force && apache2-foreground

# 🩺 Healthcheck
HEALTHCHECK CMD curl -f http://localhost:10000/api/v1/products || exit 1
