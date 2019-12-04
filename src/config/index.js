(() => {
    const
        router = require('router'),
        requester = require('Requester'),
        endecUtil = require('EndecUtil'),
        globalAppData = require('globalAppData'),

        logUtil = require('LogUtil');

    router.get('/', (req, res) => {

        var
            // Access token
            accessTokenClientID = globalAppData.get('playListClientID'),
            clientId = globalAppData.get('clientID'),
            clientSecret = globalAppData.get('playListPolicyKey'),
            accessTokenURL = 'https://oauth.brightcove.com/v4/access_token?grant_type=client_credentials',
            authString = endecUtil.base64encode(accessTokenClientID + ':' + clientSecret),
            accessTokenReqOptions = {
                contentType: 'application/x-www-form-urlencoded',
                headers: {
                    'Authorization': 'Basic ' + authString
                }
            },
            accessToken,
            // Playlist
            playlistURL = 'https://cms.api.brightcove.com/v1/accounts/' + clientId + '/playlists',
            playlistReqOptions,
            playlist;

        requester.post(accessTokenURL, accessTokenReqOptions)
            .done(function (result, statusCode, headers) {
                accessToken = result.access_token;
            })
            .fail(function (message, status) {

                logUtil.error('Could not get access token for BrightCove: ' + JSON.stringify(message));
            });

        playlistReqOptions = {
            contentType: 'application/x-www-form-urlencoded',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        };

        requester.get(playlistURL, playlistReqOptions)
            .done(function (result, statusCode, headers) {
                playlist = result;
            })
            .fail(function (message, status) {

                playlist = [];
                logUtil.error('Could not get playlists for BrightCove: ' + JSON.stringify(message));
            });


        res.render({
            playlist: playlist
        });
    });
})();