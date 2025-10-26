FROM wyveo/nginx-php-fpm:php82

MAINTAINER JOBEE

# Install dependencies và PHP extensions cho PostgreSQL
RUN apk add --no-cache \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /var/www/html

# Copy composer files để cache dependencies
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader

# Copy toàn bộ source code
COPY . .

# Generate app key
RUN php artisan key:generate

# Tạo thư mục log và set permissions
RUN mkdir -p /var/www/html/docker/nginx_log /var/www/html/docker/php_fpm \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/docker \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/docker

# Copy file cấu hình Nginx
COPY docker/config/app.conf /etc/nginx/conf.d/app.conf

# Copy và cấu hình PHP-FPM
COPY docker/php-fpm.conf /etc/php/8.2/fpm/php-fpm.conf

# Expose port 80 (Nginx)
EXPOSE 80

# Start PHP-FPM và Nginx
CMD ["/start.sh"]