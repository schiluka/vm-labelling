import os
from flask import Flask, redirect, request, session, url_for, jsonify
import requests
from datetime import datetime, timedelta
from functools import wraps

app = Flask(__name__)
BASE_URL = 'https://api.box.com/'


def requires_auth(func):
    """Checks for OAuth credentials in the session"""
    @wraps(func)
    def checked_auth(*args, **kwargs):
        if 'oauth_credentials' not in session:  
            """or check in file"""
            return redirect(url_for('login'))
        else:
            return func(*args, **kwargs)
    return checked_auth


@app.route('/')
def redirect_to_folder():
    return redirect(url_for('box_folder', folder_id='1311201105'))


@app.route('/box-folder/<folder_id>')
@requires_auth
def box_folder(folder_id):
    api_response = get_box_folder(folder_id)
    page_output = {
        'access_token': session['oauth_credentials']['access_token'],
        'api_response': api_response.json
    }
    return jsonify(page_output)


@app.route('/box-auth')
def box_auth():
    oauth_response = get_token(code=request.args.get('code'))
    boxFile = open('./auth-tokens', 'w')
    access_token = oauth_response.get('access_token')
    refresh_token = oauth_response.get('refresh_token')
    token_expiration = oauth_response.get('expires_in')
    oauth_expiration= (datetime.now()
                   + timedelta(seconds=token_expiration - 15))
    boxFile.write(access_token + '\n')
    boxFile.write(refresh_token + '\n')
    print 'access:' + access_token
    print 'refresh:' + refresh_token
    print 'token:' + str(token_expiration)
    print 'oauth:' + str(oauth_expiration)
    boxFile.write(str(oauth_expiration))
    boxFile.flush()
    boxFile.close()
    set_oauth_credentials(oauth_response)
    return redirect(url_for('box_folder', folder_id='1311201105'))


@app.route('/login')
def login():
    if os.path.exists('./auth-tokens'):
        print 'in if=========='
        boxFile = open('./auth-tokens', 'r')
        access_token = boxFile.readline()
        refresh_token = boxFile.readline()
        oauth_expiration = boxFile.readline()
        boxFile.close()
        print 'file closed=========='
        oauth_expiration_str = oauth_expiration[:19]
        print 'oauth_expiration_str' + oauth_expiration_str
        """Format 2013-11-30 03:36:23"""
        oauth_expiration_date = datetime.strptime(oauth_expiration_str, '%Y-%m-%d %H:%M:%S')
        session['oauth_expiration'] = oauth_expiration_date
        if oauth_credentials_are_expired():
            oauth_response = get_token(grant_type='refresh_token',
                               refresh_token=refresh_token)
            print 'oauth_response:' + oauth_response
            set_oauth_credentials(oauth_response)
        else:
            """ set file auth contents into session """
            print 'need to set session'
            session['access_token_login'] = access_token
        api_response = get_box_folder('1311201105')
        print 'api_response.json==============' + str(api_response.json)
        return jsonify(api_response.json)
    else:
        print 'in else=========='
        params = {
            'response_type': 'code',
            'client_id': '0gd3ftzthjbr0zu0lsseh8lgp16rwmg2'
        }
        return redirect(build_box_api_url('oauth2/authorize', params=params))


@app.route('/logout')
def logout():   
    """write tokens back to file """
    session.clear()
    return 'You are now logged out of your Box account.'

# OAuth 2 Methods

def refresh_access_token_if_needed(func):
    """
    Does two checks:
    - Checks to see if the OAuth credentials are expired based
    on what we know about the last access token we got
    and if so refreshes the access_token
    - Checks to see if the status code of the response is 401,
    and if so refreshes the access_token
    """
    @wraps(func)
    def checked_auth(*args, **kwargs):
        if oauth_credentials_are_expired():
            refresh_oauth_credentials()

        """calls get_box_folder"""
        api_response = func(*args, **kwargs) 
        if api_response.status_code == 401:
            refresh_oauth_credentials()
            """calls get_box_folder"""
            api_response = func(*args, **kwargs)    

        return api_response
    return checked_auth


@refresh_access_token_if_needed
def get_box_folder(folder_id):  
    """Send drop downs from here"""
    """No error checking. If an error occurs, we just return its JSON"""
    resource = '2.0/folders/%s' % folder_id
    url = build_box_api_url(resource)
    bearer_token = session['access_token_login']
    if bearer_token is None:
        bearer_token = session['oauth_credentials']['access_token']
    auth_header = {'Authorization': 'Bearer %s' % bearer_token}

    api_response = requests.get(url, headers=auth_header)
    return api_response


def oauth_credentials_are_expired():
    return datetime.now() > session['oauth_expiration']


def refresh_oauth_credentials():
    """
    Gets a new access token using the refresh token grant type
    """
    refresh_token = session['oauth_credentials']['refresh_token']
    oauth_response = get_token(grant_type='refresh_token',
                               refresh_token=refresh_token)
    set_oauth_credentials(oauth_response)


def set_oauth_credentials(oauth_response):
    """
    Sets the OAuth access/refresh tokens in the session,
    along with when the access token will expire

    Will include a 15 second buffer on the exipration time
    to account for any network slowness.
    """
    token_expiration = oauth_response.get('expires_in')
    session['oauth_expiration'] = (datetime.now()
                                   + timedelta(seconds=token_expiration - 15))
    print 'setting oauth_response into session==============' + str(oauth_response)
    session['oauth_credentials'] = oauth_response


def get_token(**kwargs):
    """
    Used to make token requests to the Box OAuth2 Endpoint

    Args:
        grant_type
        code
        refresh_token
    """
    url = build_box_api_url('oauth2/token')
    if 'grant_type' not in kwargs:
        kwargs['grant_type'] = 'authorization_code'
    kwargs['client_id'] = '0gd3ftzthjbr0zu0lsseh8lgp16rwmg2'
    kwargs['client_secret'] = 'J2OW2LYQsiNIXd7QEwUxfIE9hMZR97PK'
    kwargs['redirect_url'] = 'http://localhost:5000/'
    token_response = requests.post(url, data=kwargs)
    return token_response.json


def build_box_api_url(endpoint, params=''):
    if params != '':
        params = '&'.join(['%s=%s' % (k, v) for k, v in params.iteritems()])
    url = '%s%s?%s' % (BASE_URL, endpoint, params)
    return url


if __name__ == '__main__':
    # Bind to PORT if defined, otherwise default to 5000.
    port = int(os.environ.get('PORT', 5000))
    app.debug = True
    app.secret_key = '12345abcde'
    app.run(host='localhost', port=port)