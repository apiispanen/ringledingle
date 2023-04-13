import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import *
import base64

def send_email(to_email='apiispanen@berkeley.edu', attachment=None, lyrics=None):
    try:
        from apps.home.creds import SENDGRID_KEY
    except:
        SENDGRID_KEY = os.getenv('SENDGRID_KEY')
    
    if lyrics:
        lyrics = lyrics.replace('\n', '<br>')
        lyrics = lyrics.replace('STARTPOEM', '')
        lyrics = lyrics.replace('ENDPOEM', '')

    message = Mail(
        from_email='appiispanen@gmail.com',
        to_emails=[To(to_email), To('apiispanen@berkeley.edu')],
        subject='Your RingleDingle in this Thingle',
        html_content=f'<strong>Ringles are great, especially with Dingles. Happy whatever day. Add some Ringle to your Dingle.</strong><br><br>{lyrics}')
    
    if attachment:
        with open('apps/static/media/output.mp3', 'rb') as f:
            data = f.read()
            f.close()
        encoded_file = base64.b64encode(data).decode()

        attachedFile = Attachment(
            FileContent(encoded_file),
            FileName('ringledingle.mp3'),
            FileType('audio/mpeg'),
            Disposition('attachment')
        )
        message.attachment = attachedFile

    try:
        sg = SendGridAPIClient(SENDGRID_KEY)
        response = sg.send(message)
        print(response.status_code)
        print(response.body)
        print(response.headers)
    except Exception as e:
        print(e)
