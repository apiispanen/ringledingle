from google.cloud import storage
from google.oauth2.credentials import Credentials
import json
import qrcode
import datetime
import os
from flask import request


from pymongo import MongoClient

# connect to the database
if os.environ.get('MONGO_URL'):
    client = MongoClient(os.environ.get('MONGO_URL'))
else:
    client = MongoClient("mongodb://mongo:3wnvDTLmNvSxf7CgACvt@containers-us-west-129.railway.app:6471")
db = client["ringledingle"]
collection = db["ringledingle"]

def upload_file(filename='apps/static/media/output.mp3', upload_dir =''):
    try:
        GOOGLE_JSON = json.loads(os.getenv('GOOGLE_JSON'))
        storage_client = storage.Client.from_service_account_info(GOOGLE_JSON)
        print('The Google Creds are found')
    except:
        storage_client = storage.Client.from_service_account_json('apps/home/google.json')
        print('The Google KEY environment variable is not set. Using google.json')

    # Create a bucket object for our bucket
    bucket = storage_client.get_bucket('ringledingle')
    print("trying to upload file {} to google cloud storage in directory {}".format(filename, upload_dir))
    # print timestamp to be used as filename
    # timestamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")

    # filename = 'apps/static/media/output.mp3'
    blob = bucket.blob(f'{upload_dir}')

    blob.upload_from_filename(filename)

    print(f'File {filename} uploaded to {blob.public_url}')

    # Return URL
    return blob.public_url

def generate_qr_code(url, filepath='qr_code.png'):
    """Generates a QR code from a URL."""
    qr = qrcode.QRCode(version=None, box_size=10, border=4)
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Save the QR code image to a file
    img.save(filepath)
    print("QR code saved to qr.png.")
    return filepath
# generate_qr_code('https://storage.googleapis.com/ringledingle/cards/230425/My%20Wonderful%20Mom%2C%20Sue/output.mp3')

def log_info(email, collection=collection):
    email = email.lower()


    email_list = []  # always include a Bcc address
    if ',' in email:
        # split the comma-separated string into a list of email addresses
        to_email_list = [e.strip() for e in email.split(',')]
        email_list.extend(to_email_list)
    else:
        email_list.append(email)

    # get all emails, if the email is already in the database, don't add it:
    emails = collection.find()
    emails = [email['email'] for email in emails]
    for email in email_list:
        # MAKE SURE WE HAVE A RECORD
        if email not in emails:
            now = datetime.datetime.now()
            log_time = now.strftime("%Y-%m-%d %H:%M:%S")
            try:
                ip_address = request.remote_addr
            except:
                ip_address = "unknown"
            collection.insert_one({"email": email, "timestamp": log_time, "ip_address": ip_address})
        else:
            print("Email already in database.")

def store_song(user_email, title, json_lyrics, imgsrc, audiopath, singer_name, collection=collection):
    user_email = user_email.lower()

    # UPLOAD THE IMG AUDIO AND LYRICS TO GOOGLE CLOUD STORAGE, THEN RETURN URLS
    
    audio_url = upload_file(audiopath, f'cards/users/{user_email}/{title}/output.mp3')
    
    json_url = upload_file(json_lyrics, f'cards/users/{user_email}/{title}/lyrics.json')

    img_url = upload_file(imgsrc, f'cards/users/{user_email}/{title}/img.png')
    
    # get all emails, if the email is already in the database, don't add it:
    emails = collection.find()
    emails = [email['email'] for email in emails]
    if user_email not in emails:
        now = datetime.datetime.now()
        log_time = now.strftime("%Y-%m-%d %H:%M:%S")
        try:
            ip_address = request.remote_addr
        except:
            ip_address = "unknown"
        collection.insert_one({"email": user_email, "timestamp": log_time, "ip_address": ip_address})
    else:
        print("Email already in database.")
    
    song_data = {
        "title": title,
        "albumart": img_url,
        "audio": audio_url,
        "json": json_url,
        "author": singer_name
    }

    collection.update_one({"email": user_email}, {"$push": {"songs": {"$each": [song_data], "$position": 0}}})

def clear_songs_for_user(user_email, collection=collection):
    user_email = user_email.lower()

    # Update the 'songs' field for the user with the specified email
    collection.update_one({"email": user_email}, {"$set": {"songs": []}})

# store_song("appiispanen@gmail.com", "TeST", "apps/static/temp/lyrics.json", "apps/static/temp/albumart.png", "apps/static/temp/output.mp3", "Singer Name")

def get_json_for_user(user_email, collection=collection):
    # Convert user_email to lowercase
    user_email = user_email.lower()

    # Find the user document by email
    user_document = collection.find_one({"email": user_email})

    if user_document:
        # Return the 'songs' field as a JSON string
        return json.dumps(user_document['songs'])
    else:
        print("User not found.")
        return json.dumps([])
