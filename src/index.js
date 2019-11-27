(function () {

    'use strict';

    var
        router = require('router'),
        appData = require('appData'),
        globalAppData = require('globalAppData'),
        requester = require('Requester'),
        versionUtil = require('VersionUtil'),
        resourceLocatorUtil = require('ResourceLocatorUtil'),
        instanceCreatorUtil = require('InstanceCreatorUtil'),

        logUtil = require('LogUtil');

    function getVideoThumbnail(sources) {
        var src = false,
            s;

        if (sources && sources.length) {
            for (var i = 0; i < sources.length; i += 1) {
                s = sources[i].src;
                s && (src = s);
                if (src && src.startsWith('https')) {
                    break;
                }
            }
        }

        return src;
    }

    function getVideoData(video, useExternal) {
        return {
            id: video.id.toString(),
            name: video.name,
            thumbnailURL: getVideoThumbnail(video.thumbnail_sources),
            useExternalVideoLink: !!(useExternal)
        };
    }

    function getURL(anId, aLimit, aClientId) {

        var url = 'https://edge.api.brightcove.com/playback/v1/accounts/' + aClientId + '/playlists/' + anId + '?limit=' + aLimit;

        return url;
    }

    router.get('/', function (req, res) {

        var playlistID = appData.get('playlistID'),
            policyKey = globalAppData.get('policyKey'),
            sitePage = resourceLocatorUtil.getSitePage(),
            siteUrl = sitePage.getProperty('URL').value.toString(),
            isExtWeb = (siteUrl.indexOf('komin') === -1),
            hasPlaylist = false,
            limit = (isExtWeb ? appData.get('amount') : 4), // 4 videos for komin!
            clientId = globalAppData.get('clientID'),
            url = getURL(playlistID, limit, clientId),

            reqOptions = {
                contentType: 'application/x-www-form-urlencoded',
                headers: {
                    'Authorization': 'BCOV-Policy ' + policyKey
                }
            },
            playlist = [],
            videoClassName = 'n' + limit,
            editmode = !(versionUtil.getCurrentVersion()),
            filter;

        if (!playlistID) {
            return;
        }

        filter = isExtWeb ?
            instanceCreatorUtil.getArraysInstance().asList(['null', 'malmo-se']) :
            instanceCreatorUtil.getArraysInstance().asList(['null', 'komin']);

        requester.get(url, reqOptions)
            .done(function (result, statusCode, headers) {

                var limitCounter = 0,
                    _targetGroup,
                    _video;

                if (result && result.videos && result.videos.length) {

                    for (let i = 0; i < result.videos.length; i++) {

                        _targetGroup = null;
                        _video = result.videos[i];

                        if (_video.custom_fields && _video.custom_fields.targetgroup) {
                            _targetGroup = _video.custom_fields.targetgroup;
                        }

                        if (_targetGroup) {
                            if (filter === _targetGroup) {
                                playlist.push(getVideoData(_video));
                                limitCounter++;
                            }
                        } else {
                            playlist.push(getVideoData(_video));
                            limitCounter++;
                        }

                        hasPlaylist = true;

                        if (limitCounter >= limit) {
                            return;
                        }
                    }
                }
            })
            .fail(function (message, status) {

                logUtil.error('Error getting video playlist: ' + message);

            });

        res.render('/', {
            editmode: editmode,
            videoClassName: videoClassName,
            playlist: playlist,
            hasPlaylist: hasPlaylist
        });
    });

}());