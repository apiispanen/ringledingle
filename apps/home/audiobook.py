import librosa
from pydub import AudioSegment
from pydub.generators import Sine
import pyphen
# from apps.home.azure_test import azure_audio_segment

from apps.home.uber import uberduck_audio_segment
from pydub.effects import speedup
from pydub.silence import detect_nonsilent
from pydub import AudioSegment
from pydub.utils import make_chunks

import random
import audioop
import io
import re
import requests


import json

def make_narration(input_file, output_file, lyrics, start_lag=8, music_volume=20, vocal_volume=0, voice="alan-rickman", silence_thresh=-60, spacing=1, fade_out_duration=8000):
    

    def phrases_to_json(phrases, start_times):
        json_output = {"lyrics": []}

        for phrase, start_time in zip(phrases, start_times):
            json_output["lyrics"].append({
                "line": phrase,
                "time": int(start_time * 1000)
            })

        return json_output
    
    try:
        #close input file from its path string
        with open(input_file, 'rb') as f:
            f.close()
        #close output file from its path string
        with open(output_file, 'rb') as f:
            f.close()
    except:
        print("File not found")
    print("Making a narration from {} in the voice of {}. Exporting to {}".format(input_file, voice, output_file))

    # Load input audio file
    if input_file.startswith(('http://', 'https://')):
        response = requests.get(input_file)
        y, sr = librosa.load(io.BytesIO(response.content), sr=None)
    else:
        y, sr = librosa.load(input_file, sr=None)

    # Create an empty audio segment
    output_audio = AudioSegment.silent(duration=len(y) / sr * 1000)

    # Split the lyrics into phrases
    phrases = re.split(r'[\n.]', lyrics.strip())
    phrases = [phrase.strip() for phrase in phrases if phrase.strip() != '']

    phrase_start = start_lag
    phrase_start_times = []


    for phrase in phrases:
        print("PHRASE:", phrase)
        # Generate spoken audio for the current phrase
        
        # Try the below line 3 times before giving up
        for i in range(3):
            try:
                spoken_phrase = uberduck_audio_segment(phrase, voice=voice)
                break
            except Exception as e:
                print(f"Error with Uberduck - trial {i}, error {e}")
                spoken_phrase = AudioSegment.silent(duration=1)
                continue  
        
        # try:
        #     spoken_phrase = strip_silence(spoken_phrase, silence_thresh=silence_thresh)
        # except:
        #     print("Error with silence stripping")

        # Overlay the spoken audio on the input audio
        output_audio = output_audio.overlay(
            spoken_phrase,
            position=int(phrase_start * 1000)
        )

        # Update the phrase start time for the next phrase with added spacing
        phrase_start_times.append(phrase_start)
        phrase_start += spoken_phrase.duration_seconds + spacing
    

    # Combine the input audio with the spoken phrases
    # Generate JSON lyrics
    json_lyrics = phrases_to_json(phrases, phrase_start_times)
    print("Looking for input file at {}".format(input_file))
    input_audio = AudioSegment.from_file(input_file)
    input_audio = input_audio - music_volume
    output_audio = output_audio + vocal_volume
    print("overlaying audio")
    combined_audio = input_audio.overlay(output_audio)

    # Fade out the audio at the end
    last_phrase_end = (phrase_start - spacing)
    fade_out_start = last_phrase_end * 1000 + fade_out_duration
    combined_audio = combined_audio[:fade_out_start].fade_out(duration=fade_out_duration)

    # Save the result to a new file
    combined_audio.export(output_file, format="mp3")
    print(f"Narration exported to {output_file}")
    # Save JSON lyrics to a file

    json_lyrics_filepath = "apps/static/temp/lyrics.json"

    with open(json_lyrics_filepath, "w") as json_file:
        json.dump(json_lyrics, json_file, indent=4)
    return json_lyrics_filepath


# lyrics = """

#  my mom's name is maddew,
# a woman so giving and true
# she loves to watch TeeVee,
# and spend time with her family

# her hart is peir gold,
# a kindness that never grows old
# she gives without expecting return,
# her love for others truly does burn

# maddew is a special kind of person,
# one who brightens up the darkest of curtains
# i am blessed to call her my mother,
# and i will always cherish her like no other,

# Happy Mother's Day, with love from Ronnie and Drew


# """
# make_narration("apps/static/media/pensive.mp3", "output_audio.mp3", lyrics, voice="betty-white")

# # # # Usage
# input_file = "apps/static/media/magic.mp3"
# # input_file = "C:/Users/appii/Google Drive/RingleDingle Folder/Background-music/magic.mp3"
# output_file = "output_audio.mp3"

# lyrics = """Oh, Mary Jane, you're quite the dame,
# With your pungent scent and smoky flame.
# You bring us joy and ease our pain,
# And help us forget life's mundane.

# From joints to bongs, we love it all,
# Your sweet embrace never lets us fall.
# Through laughter and tears, you're always there,
# A loyal friend beyond compare.

# Some may judge and call you wrong,
# But we know better, we sing your song.
# For in your leaves lies a magic power,
# That can uplift even the darkest hour.

# So here's to you, dear Mary Jane,
# May your reign forever sustain.
# We'll keep on toking with pride and glee,
# For in our hearts, you'll always be."""

# make_narration(input_file, output_file, lyrics)
