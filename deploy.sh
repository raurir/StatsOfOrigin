echo Deploying www to s3
cd deploy
aws s3 sync . s3://www.statsoforigin.com --acl public-read