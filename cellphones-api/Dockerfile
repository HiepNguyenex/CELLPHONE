# ===============================================
# 🐘 Laravel 12.x - Render Optimized Dockerfile (Safe Build v3)
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

# 3️⃣ Copy composer files first (for better build caching)
COPY composer.json composer.lock ./

# 4️⃣ Copy Composer binary (from official image)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# 5️⃣ Install dependencies (NO artisan, NO autoloader conflicts)
#    -> prevents "package:discover" crash during build
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist \
 && composer dump-autoload -o --no-scripts

# 6️⃣ Copy project source code
COPY . .

# 7️⃣ Prepare SQLite database (Render compatible)
RUN mkdir -p database && touch database/database.sqlite && chmod 777 database/database.sqlite

# 8️⃣ Copy .env if missing
RUN if [ ! -f ".env" ]; then cp .env.example .env; fi

# 9️⃣ Generate app key & warm caches
RUN php artisan key:generate || true \
 && php artisan config:clear && php artisan cache:clear && php artisan route:clear && php artisan view:clear \
 && php artisan config:cache && php artisan route:cache && php artisan view:cache

# ✅ Make Apache serve from /public directory
RUN sed -i 's|/var/www/html|/var/www/html/public|g' /etc/apache2/sites-available/000-default.conf

# 🔟 Configure Render port
EXPOSE 10000
ENV PORT=10000
RUN sed -i "s/80/${PORT}/g" /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf

# 🧩 Reinforce ServerName (double-safe)
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# 🪄 Entrypoint script: clear caches before container starts
RUN echo '#!/bin/bash\nphp artisan config:clear && php artisan cache:clear && php artisan route:clear && php artisan view:clear\nexec "$@"' > /entrypoint.sh \
 && chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

# 🚀 Run migrations + seed + start Apache
CMD php artisan migrate:fresh --seed --force && apache2-foreground

# 🩺 Healthcheck: verify API availability
HEALTHCHECK CMD curl -f http://localhost:10000/api/v1/products || exit 1
