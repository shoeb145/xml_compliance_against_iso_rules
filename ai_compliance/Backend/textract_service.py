# textract_service.py
import boto3
import os
from s3_service import s3_service  # Import S3 service

class AWSTextract:
    def __init__(self):
        self.textract_client = boto3.client(
            'textract',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name='ap-south-1'
        )
    
    def extract_text_from_s3(self, s3_url):
        """Extract text from image in S3"""
        try:
            # Get bucket name from S3 service
            bucket_name = s3_service.bucket_name
            # Extract file key from URL
            key = s3_url.split(f"{bucket_name}.s3.amazonaws.com/")[1]
            
            response = self.textract_client.detect_document_text(
                Document={
                    'S3Object': {
                        'Bucket': bucket_name,
                        'Name': key
                    }
                }
            )
            
            extracted_text = ""
            for item in response["Blocks"]:
                if item["BlockType"] == "LINE":
                    extracted_text += item["Text"] + "\n"
            
            print(f"📄 AWS Textract: Extracted {len(extracted_text)} characters")
            return extracted_text.strip()
            
        except Exception as e:
            print(f"❌ AWS Textract error: {e}")
            return "Unable to extract text from image"

# Global instance
textract_service = AWSTextract()