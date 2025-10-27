# ===============================================
# 🐘 Laravel 12.x - Render Stable Dockerfile (v5)
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

# 3️⃣ Copy composer files first (for caching)
COPY composer.json composer.lock ./

# 4️⃣ Copy Composer binary
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# 5️⃣ Install dependencies (safe build mode)
RUN composer install --no-dev --no-scripts --prefer-dist --optimize-autoloader \
 && composer dump-autoload -o --no-scripts

# 6️⃣ Copy full project
COPY . .

# 7️⃣ Prepare SQLite + fix permissions
RUN mkdir -p database && touch database/database.sqlite \
 && mkdir -p storage/framework/{cache,sessions,views} bootstrap/cache \
 && chmod -R 777 storage bootstrap/cache database

# 8️⃣ Copy .env if missing
RUN if [ ! -f ".env" ]; then cp .env.example .env; fi

# 9️⃣ Generate key & cache config safely
RUN php artisan key:generate || true \
 && php artisan config:clear && php artisan cache:clear && php artisan route:clear \
 && php artisan config:cache && php artisan route:cache

# ✅ Set Apache to serve /public
RUN sed -i 's|/var/www/html|/var/www/html/public|g' /etc/apache2/sites-available/000-default.conf

# 🔟 Configure Render port
EXPOSE 10000
ENV PORT=10000
RUN sed -i "s/80/${PORT}/g" /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf

# 🪄 Entrypoint: safe cache clear at container start
RUN echo '#!/bin/bash\nchmod -R 777 storage bootstrap/cache\necho "🧹 Clearing Laravel caches..."\nphp artisan config:clear && php artisan cache:clear && php artisan route:clear && php artisan view:clear\nexec "$@"' > /entrypoint.sh \
 && chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

# 🚀 Start app (auto migrate + seed)
CMD php artisan migrate:fresh --seed --force && apache2-foreground

# 🩺 Healthcheck (ping route = always OK)
HEALTHCHECK CMD curl -f http://localhost:10000/api/v1/ping || exit 1
