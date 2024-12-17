FROM httpd:2.4
# Copy files from /prod to the default apache web directory
COPY ./prod/ /usr/local/apache2/htdocs/
# Copy .hataccess fle to the default apache web directory
#COPY ./.htaccess /usr/local/apache2/htdocs/
# Ensure fles are readable by apache
RUN chmod -R 755 /usr/local/apache2/htdocs/
# Overwrite Apache confguration with custom confgfle
#COPY ./custom-httpd.conf /usr/local/apache2/conf/httpd.conf
# Overwrite Apache configuration with custom config-file
COPY ./custom-httpd.conf /usr/local/apache2/conf/httpd.conf
# Overwrite Apache SSL configuration with custom config-file
COPY ./custom-httpd-ssl.conf /usr/local/apache2/conf/extra/httpd-
    ssl.conf