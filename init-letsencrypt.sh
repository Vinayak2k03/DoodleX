#!/bin/bash

# Domain and email settings
domains=(doodlex.vinayaknagar.tech)
email="vinayaknagar2810@gmail.com"
staging=1 # Set to 1 if you're testing to avoid hitting rate limits

data_path="./nginx/certbot"
rsa_key_size=4096

# Create dummy certificate
echo "### Creating dummy certificate for ${domains[0]} ..."
mkdir -p "$data_path/conf/live/$domains"
docker-compose run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1\
    -keyout '/etc/letsencrypt/live/$domains/privkey.pem' \
    -out '/etc/letsencrypt/live/$domains/fullchain.pem' \
    -subj '/CN=localhost'" certbot

# Start nginx
echo "### Starting nginx ..."
docker-compose up --force-recreate -d nginx

# Delete dummy certificate
echo "### Deleting dummy certificate for ${domains[0]} ..."
docker-compose run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$domains && \
  rm -Rf /etc/letsencrypt/archive/$domains && \
  rm -Rf /etc/letsencrypt/renewal/$domains.conf" certbot

# Request Let's Encrypt certificate
echo "### Requesting Let's Encrypt certificate for ${domains[@]} ..."
domain_args=""
for domain in "${domains[@]}"; do
  domain_args="$domain_args -d $domain"
done

docker-compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --email $email \
    $domain_args \
    --rsa-key-size $rsa_key_size \
    --agree-tos \
    --force-renewal" certbot

# Reload nginx
echo "### Reloading nginx ..."
docker-compose exec nginx nginx -s reload
