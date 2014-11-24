var DEFAULT_YEAR = "2014";

var devfest = angular.module('devfest', ['ngRoute', 'ngSanitize', 'ui.bootstrap', 'yaru22.md'])
    .config(function ($routeProvider) {
        $routeProvider.
            when("/:year/about", {templateUrl: 'views/about.html', controller: "AboutControl"}).
            when("/:year/code-of-conduct/:subpage?", {title: 'Code of Conduct', templateUrl: 'views/code-of-conduct.html', controller: "CodeOfConductController"}).
            when("/:year/agenda", {templateUrl: 'views/agenda.html', controller: "AgendaControl"}).
            when("/:year/agenda/session/:sessionId", {templateUrl: 'views/session.html', controller: "SessionControl"}).
            when("/:year/speakers", {templateUrl: 'views/speaker_list.html', controller: "SpeakerListControl"}).
            when("/:year/speaker/:speakerId", {templateUrl: 'views/speaker.html', controller: "SpeakerControl"}).
            when("/:year/photos", {templateUrl: 'views/photos.html', controller: "PhotosControl"}).
            when("/:year/team", {templateUrl: 'views/team.html', controller: "TeamControl"}).
            when("/:year/news", {templateUrl: 'views/news.html', controller: "NewsControl"}).
            when("/contact", {templateUrl: 'views/contact.html', controller: "ContactControl"}).
            when("/code-of-conduct", { redirectTo: '/' + DEFAULT_YEAR + '/code-of-conduct'}).
            when("/code-of-conduct/staff", { redirectTo: '/' + DEFAULT_YEAR + '/code-of-conduct/staff'}).
            when("/code-of-conduct/attendees", { redirectTo: '/' + DEFAULT_YEAR + '/code-of-conduct/attendees'}).
            otherwise({ redirectTo: '/' + DEFAULT_YEAR + '/about' }); //FIXME how to use the config object here?
    });

devfest.factory('Config', function () {
    return {
        'name': 'DevFest Berlin',
        'google_plus_page_id': '116495772997450383126',
        'google_api': 'AIzaSyBs64m_HUrQE864HfvEP87y6aqPaOYvmiQ',
        'default_year': DEFAULT_YEAR, //picks from the years object if none is defined in the url
        "email": 'team@devfest-berlin.de',
        'pwa_id': {
            "DevFest Berlin 2012": "5940164247434937905",
            "DevFest Berlin 2013": "5940170057320370689"
        },
        'years': {
            '2013': {
                'dates': {
                    'workshops': '2013-11-01',
                    'conference': '2013-11-02',
                    'hackathon': '2013-11-03'
                },
                'google_plus_event_id': 'csc1rob3gekqalff7919h0e4qrk', //must be public
                'picasa_album_id': "5940170057320370689", //picasa web album id, must belong to google+ page id above
                'cover': {
                    title: 'DevFest Berlin',
                    subtitle: 'November 1st - 3rd, 2013',
                    button: {
                        text: 'Event is over',
                        url: 'https://berlin.ticketbud.com/devfest-berlin-2013',
                        disabled: true
                    }
                },
                "team_ids": [ //must be Google+ profile ids
                    "117509657298845443204", //ben
                    "111820256548303113275", //surma
                    "110214177917096895451", //cketti
                    "111119798064513732293", //david
                    "110167958764078863962", //dirk
                    "109673287110815740267", //hasan
                    "108253608683408979021", //michael
                    "111333123856542807695", //stevie
                    "110615325729051596989" //jerome
                ],
                "sponsor_contacts": [
                    "117509657298845443204", //ben
                    "111119798064513732293", //david
                    "111333123856542807695" //stevie
                ]
            },
            '2014': {
                'dates': {
                    'workshops': '2014-11-21',
                    'conference': '2014-11-22',
                    'hackathon': '2014-11-23'
                },
                'google_plus_event_id': 'c1u8933vkjrog9uklt58o7frj24', //must be public
                'picasa_album_id': "6073481044801655761", //picasa web album id, must belong to google+ page id above
                'cover': {
                    title: 'DevFest Berlin',
                    subtitle: 'November 21st - 23rd, 2014',
                    button: {
                        text: 'Get your ticket NOW',
                        url: 'https://devfest-berlin.ticketbud.com/devfest-berlin-2014',
                        disabled: true
                    }
                },
                "team_ids": [ //must be Google+ profile ids
                    "111820256548303113275", //surma
                    "110214177917096895451", //cketti
                    "110167958764078863962", //dirk
                    "109673287110815740267", //hasan
                    "111333123856542807695", //stevie
                    "110615325729051596989" //jerome
                ],
                "sponsor_contacts": [
                    "109673287110815740267", //hasan
                    "111820256548303113275", //surma
                    "111333123856542807695" //stevie
                ]
            }
        }
    }
});

devfest.service('AgendaService', ['$http', function ($http) {

    function _getAgenda(year) {

        var promise = $http.get('/data/' + year + '/agenda.json').then(
            function (result) {
                var agenda = result.data;

                angular.forEach(agenda.days, function (day) {

                    var slots = {};

                    angular.forEach(day.slots, function (slot) {
                        dayDate = day.date.replace("-","/").replace("-","/");
                        slot.time_start = new Date(dayDate + ' ' + slot.time_start);
                        slot.time_end = new Date(dayDate + ' ' + slot.time_end);


                        if (!slots.hasOwnProperty(slot.time_start.toString())) {
                            slots[slot.time_start.toString()] = [];
                        }

                        slots[slot.time_start.toString()].push(slot);

                        var speakers = [];
                        angular.forEach(slot.speaker_ids, function (id) {
                            var tmpSpeaker = agenda.speakers[id];
                            tmpSpeaker.id = id;
                            speakers.push(tmpSpeaker);
                        });

                        slot.speakers = speakers;
                        slot.room = agenda.rooms[slot.room_id];
                        slot.id = slot.time_start.getTime() + '_' + slot.room_id;
                    });

                    day.slots = slots;
                });

                angular.forEach(agenda.speakers, function (speaker) {
                    if (!speaker.img) {
                        speaker.img = "images/speech_bubble.png";
                    }
                });


                return agenda;
            },
            function (error) {
                console.log(error);
            }
        );

        return promise;
    }

    this.getFullAgenda = function (year) {
        var promise = _getAgenda(year).then(function (agenda) {
            return agenda;
        });

        return promise;
    }

    this.getSession = function (year, sessionId) {

        var promise = _getAgenda(year).then(function (agenda) {

            var foundSession = 0;

            angular.forEach(agenda.days, function (day) {

                if (foundSession === 0) { //Angular forEach has no break
                    angular.forEach(day.slots, function (slotArray) {
                        angular.forEach(slotArray, function (session) {
                            if (session.id == sessionId) {

                                if (session.youtube_id) {
                                    session.youtube_url = '//www.youtube-nocookie.com/embed/' + session.youtube_id;
                                }

                                foundSession = session;
                                return;
                            }
                        });
                    });
                }
            });

            return foundSession;
        });

        return promise;
    }

    this.getSpeakerList = function (year) {
        var promise = _getAgenda(year).then(function (agenda) {
            return agenda.speakers;
        });

        return promise;
    }

    this.getSpeaker = function (year, speakerId) {
        var promise = _getAgenda(year).then(function (agenda) {
                    var speaker = {};
                    angular.forEach(agenda.speakers, function (speakerIter, id) {
                        if (id == speakerId) {
                            speaker = speakerIter;
                        }
                    });
                    speaker.sessions = [];
                    angular.forEach(agenda.days, function (day) {
                        angular.forEach(day.slots, function (slotArray) {
                            angular.forEach(slotArray, function (session) {
                                angular.forEach(session.speaker_ids, function (ids) {
                                    if (ids == speakerId && session.track) {
                                        speaker.sessions.push(session);
                                    }
                                });
                            });
                        });
                    });

                    return speaker;
                }
            )
            ;

        return promise;
    }
}
])
;
devfest.controller('MainControl', function ($scope, Config) {

    $scope.year = Config.default_year;
    $scope.site_name = Config.name;
    $scope.google_plus_link = 'https://plus.google.com/' + Config.google_plus_page_id;
    $scope.google_plus_event_link = 'https://plus.google.com/events/' + Config.years[$scope.year].google_plus_event_id;
    $scope.isCollapse = true;
    $scope.default_year = Config.default_year;
});

devfest.controller('AboutControl', function ($scope, $http, $location, $routeParams, Config) {

    var year = $routeParams.year;
    $scope.loading = true;

    $scope.$parent.year = year; //make sure the main controller knows about the year from the url
    $scope.$parent.activeTab = "about";
    $scope.cover = Config.years[year].cover;
    $scope.dates = Config.years[year].dates;

    $http.jsonp('https://www.googleapis.com/plus/v1/people/' + Config.google_plus_page_id + '?callback=JSON_CALLBACK&fields=aboutMe%2Ccover%2Cimage%2CplusOneCount&key=' + Config.google_api).
        success(function (data) {
            $scope.desc = data.aboutMe;
            if (data.cover && data.cover.coverPhoto.url) {
                $scope.cover.url = data.cover.coverPhoto.url;
            }
            $scope.loading = false;
        });
});

devfest.controller('CodeOfConductController', function ($scope, $http, $location, $routeParams) {

    var year = $routeParams.year;
    $scope.$parent.year = year; //make sure the main controller knows about the year from the url
    $scope.$parent.activeTab = "code-of-conduct";
    
    $scope.subpage = $routeParams.subpage;

    var mdUrl;
    switch ($scope.subpage) {
        case "staff":
            $scope.mdUrl = "/data/code-of-conduct/staff-procedure-incidents.md";
            $scope.subline = "Staff Procedure for incident handling"
            break;
        case "attendees":
            $scope.mdUrl = "/data/code-of-conduct/attendee-procedure-incidents.md";
            $scope.subline = "Attendee Procedure for incident handling"
            break;
        default:
        $scope.subline = "Our Rules"
        $scope.mdUrl = "/data/code-of-conduct/code_of_conduct.md";
    }
});

devfest.controller("NewsControl", function ($scope, $routeParams, $http, $timeout, Config) {

    $scope.loading = true;

    $scope.$parent.pageTitle = "Latest news";
    $scope.$parent.activeTab = "news";
    $scope.$parent.year = $routeParams.year; //make sure the main controller knows about the year from the url

    $http.
        jsonp('https://www.googleapis.com/plus/v1/people/' + Config.google_plus_page_id + '/activities/public?callback=JSON_CALLBACK&maxResults=10&key=' + Config.google_api).
        success(function (response) {
            var entries = [];
            for (var i = 0; i < response.items.length; i++) {
                var item = response.items[i];
                var actor = item.actor || {};
                var object = item.object || {};
                // Normalize tweet to a FriendFeed-like entry.
                var item_title = '<b>' + item.title + '</b>';

                var html = [item_title.replace(new RegExp('\n', 'g'), '<br />')];
                //html.push(' <b>Read More &raquo;</a>');

                var thumbnails = [];

                var attachments = object.attachments || [];
                for (var j = 0; j < attachments.length; j++) {
                    var attachment = attachments[j];
                    switch (attachment.objectType) {
                        case 'album':
                            break;//needs more work
                            var upper = attachment.thumbnails.length > 7 ? 7 : attachment.thumbnails.length;
                            html.push('<ul class="thumbnails">');
                            for (var k = 1; k < upper; k++) {
                                html.push('<li class="col-md-2"><img src="' + attachment.thumbnails[k].image.url + '" /></li>');
                            }
                            html.push('</ul>');
                            break;
                        case 'photo':
                            console.log(attachment);
                            thumbnails.push({
                                url: attachment.url,
                                link: attachment.image.url
                            });
                            break;

                        case 'video':
                            thumbnails.push({
                                url: attachment.url,
                                link: attachment.image.url
                            });
                            html.push(attachment.displayName);
                            break;

                        case 'article':
                            html.push('<div class="link-attachment"><a href="' +
                                attachment.url + '">' + attachment.displayName + '</a>');
                            if (attachment.content) {
                                html.push('<br>' + attachment.content + '');
                            }
                            html.push('</div>');
                            break;
                        case 'event':
                            html.push('<b>' + attachment.displayName + '</b>');
                            html.push('<p>' + attachment.content.replace(new RegExp('\n', 'g'), '<br />') + '</p>');
                            break;
                    }
                }

                html = html.join('');

                var actor_image = actor.image.url;
                actor_image = actor_image.substr(0, actor_image.length - 2) + '50';

                var entry = {
                    via: {
                        name: 'Google+',
                        url: item.url
                    },
                    body: html,
                    date: item.updated,
                    reshares: (object.resharers || {}).totalItems,
                    plusones: (object.plusoners || {}).totalItems,
                    comments: (object.replies || {}).totalItems,
                    thumbnails: thumbnails,
                    icon: actor_image
                };

                entries.push(entry);
            }
            $scope.news = entries;
            $timeout(function () {
                gapi.plusone.go();
            });
            $scope.loading = false;
        });

});

devfest.controller("PhotosControl", function ($scope, $routeParams, $http, Config) {

    var year = $routeParams.year;
    var picasa_album_id = Config.years[year].picasa_album_id;

    $scope.loading = true;
    $scope.$parent.year = year; //make sure the main controller knows about the year from the url
    $scope.$parent.pageTitle = "Photos of " + year;
    $scope.$parent.activeTab = "photos";
    $scope.title = "Photos of DevFest Berlin " + year;

    $scope.album_link = "http://picasaweb.google.com/user/" + Config.google_plus_page_id + "/" + picasa_album_id;
    $scope.photos = {};

    var pwa = 'https://picasaweb.google.com/data/feed/api/user/' + Config.google_plus_page_id + '/albumid/' + picasa_album_id + '?access=public&alt=json-in-script&kind=photo&max-results=20&fields=entry(title,link/@href,summary,content/@src)&v=2.0&callback=JSON_CALLBACK';

    $scope.photos = []

    $http.jsonp(pwa).
        success(function (d) {
            var p = d.feed.entry;
            for (var x in p) {
                var photo = {
                    link: p[x].link[1].href,
                    src: p[x].content.src,
                    alt: p[x].title.$t,
                    title: p[x].summary.$t
                };
                $scope.photos.push(photo);
            }
            $scope.loading = false;
        });
});

devfest.controller('ContactControl', function ($scope, $routeParams, $http, $timeout, Config) {

    var year = $routeParams.year | Config.default_year;
    $scope.$parent.year = year; //make sure the main controller knows about the year from the url
    $scope.$parent.pageTitle = "Get in touch";
    $scope.$parent.activeTab = "contact";

    $scope.email = Config.email;
    $scope.google_plus_link = $scope.$parent.google_plus_link;

    $scope.team = [];
    var team_ids = Config.years[year].sponsor_contacts;
    $scope.shuffle = function (o) { //v1.0
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    };

    team_ids = $scope.shuffle(team_ids);

    angular.forEach(team_ids, function (teamId, index) {

        $timeout(function () {

            var gplusUrl = "https://www.googleapis.com/plus/v1/people/" + teamId + "?callback=JSON_CALLBACK&fields=displayName%2Cid%2Cimage%2Curl&key=" + Config.google_api;

            $http.jsonp(gplusUrl).
                success(function (member) {

                    member.image.url = member.image.url.replace('?sz=50', '?sz=200');
                    $scope.team.push(member);
                })

        }, (index + 1) * 200);
    });

    $scope.loading = false;
});


devfest.controller('TeamControl', function ($scope, $routeParams, $http, $timeout, Config) {

    var year = $routeParams.year;

    $scope.$parent.year = year; //make sure the main controller knows about the year from the url
    $scope.year = year; //make sure the main controller knows about the year from the url
    $scope.$parent.pageTitle = "Team Awesome";
    $scope.$parent.activeTab = "team";

    $scope.team = [];
    var team_ids = Config.years[year].team_ids;
    $scope.shuffle = function (o) { //v1.0
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    };

    team_ids = $scope.shuffle(team_ids);

    angular.forEach(team_ids, function (teamId, index) {

        $timeout(function () {

            var gplusUrl = "https://www.googleapis.com/plus/v1/people/" + teamId + "?callback=JSON_CALLBACK&fields=displayName%2Cid%2Cimage%2Curl&key=" + Config.google_api;

            $http.jsonp(gplusUrl).
                success(function (member) {

                    member.image.url = member.image.url.replace('?sz=50', '?sz=200');
                    $scope.team.push(member);
                })

        }, (index + 1) * 200);
    });

    $scope.loading = false;
});

devfest.controller('AgendaControl', function ($scope, $routeParams, AgendaService) {

    var year = $routeParams.year;
    $scope.$parent.year = year; //make sure the main controller knows about the year from the url
    $scope.$parent.pageTitle = "Agenda in " + year;
    $scope.$parent.activeTab = "agenda";

    var agenda = AgendaService.getFullAgenda(year).then(function (agenda) {
        $scope.days = agenda.days;
    });

    $scope.openSession = function (session) {
        if (session.track) {
            location.href = "#/" + year + "/agenda/session/" + session.id;
        }
    }
});

devfest.controller('SessionControl', function ($scope, $routeParams, AgendaService, $sce) {

    var year = $routeParams.year;
    $scope.$parent.year = year; //make sure the main controller knows about the year from the url
    $scope.$parent.activeTab = "agenda";

    AgendaService.getSession(year, $routeParams.sessionId).then(function (session) {

        if (session.youtube_url) {
            session.youtube_url = $sce.trustAsResourceUrl(session.youtube_url);
        }

        $scope.$parent.pageTitle = "Session: " + session.title;

        $scope.session = session;

    });

    $scope.openSpeaker = function (speaker) {
        location.href = "#/" + year + "/speaker/" + speaker.id;
    }

});

devfest.controller('SpeakerListControl', function ($scope, $routeParams, AgendaService) {

    var year = $routeParams.year;
    $scope.$parent.year = year; //make sure the main controller knows about the year from the url
    $scope.$parent.activeTab = "speakers";

    AgendaService.getSpeakerList(year).then(function (speakers) {
        $scope.speakers = speakers;

    });

    $scope.openSpeaker = function (speakerId) {
        location.href = "#/" + year + "/speaker/" + speakerId;
    }

});


devfest.filter('array', function () {
    return function (items) {
        var filtered = [];
        angular.forEach(items, function (item) {
            filtered.push(item);
        });
        return filtered;
    };
});

devfest.controller('SpeakerControl', function ($scope, $routeParams, AgendaService) {

    var year = $routeParams.year;
    var speakerId = $routeParams.speakerId;
    $scope.$parent.year = year; //make sure the main controller knows about the year from the url
    $scope.$parent.activeTab = "speakers";

    AgendaService.getSpeaker(year, speakerId).then(function (speaker) {
        $scope.speaker = speaker;
    });

    $scope.openSession = function (session) {
        if (session.track) {
            location.href = "#/" + year + "/agenda/session/" + session.id;
        }
    }
});

