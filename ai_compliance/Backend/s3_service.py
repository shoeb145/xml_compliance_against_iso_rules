# s3_service.py
import boto3
import os
import uuid

class S3Service:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name='ap-south-1'
        )
        self.bucket_name = self._create_or_get_bucket()
    
    def _create_or_get_bucket(self):
        """Create bucket or use existing one"""
        bucket_name = "compliance-uploads-" + str(uuid.uuid4())[:8]
        
        try:
            self.s3_client.create_bucket(
                Bucket=bucket_name,
                CreateBucketConfiguration={
                    'LocationConstraint': 'ap-south-1'
                }
            )
            print(f"✅ Created S3 bucket: {bucket_name}")
            return bucket_name
        except Exception as e:
            print(f"❌ Bucket creation failed: {e}")
            # Try to use existing buckets
            try:
                response = self.s3_client.list_buckets()
                if response['Buckets']:
                    existing_bucket = response['Buckets'][0]['Name']
                    print(f"✅ Using existing bucket: {existing_bucket}")
                    return existing_bucket
            except:
                raise Exception("No S3 access - check permissions")
    
    def upload_file(self, file_data, file_extension):
        """Upload file to S3"""
        try:
            file_key = f"uploads/{uuid.uuid4()}.{file_extension}"
            
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=file_key,
                Body=file_data,
                ContentType='application/octet-stream'
            )
            
            s3_url = f"https://{self.bucket_name}.s3.amazonaws.com/{file_key}"
            print(f"✅ File uploaded to S3: {s3_url}")
            return s3_url
            
        except Exception as e:
            print(f"❌ S3 upload error: {e}")
            raise e

# Global instance
s3_service = S3Service()