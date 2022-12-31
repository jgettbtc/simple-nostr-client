const Kinds = {
    Metadata: 0,
    Text: 1,
    RecommendRelay: 2,
    Contacts: 3,
    EncryptedDirectMessages: 4,
    EventDeletion: 5,
    Reaction: 7,
    ChannelCreation: 40,
    ChannelMetadata: 41,
    ChannelMessage: 42,
    ChannelHideMessage: 43,
    ChannelMuteUser: 44
};

(function($){
    $.fn.simpleNostrClient = function(options){
        return this.each(function(){
            const $this = $(this);
            
            const opts = $.extend({}, options, {'state': {
                'relay': 'wss://nostr-pub.wellorder.net/',
                'pubkey': '04c915daefee38317fa734444acee390a8269fe5810b2241e5e6dd343dfbecc9'
            }});
            
            const state = opts.state;

            let open = (s) => {
                const ws = new WebSocket(s.relay);

                ws.onopen = (e) => {s
                    console.log('Opened socket to ' + s.relay);
                    ws.send(JSON.stringify(["REQ","profile-browser",{"authors":[s.pubkey],"kinds":[0,1,2,3]}]));
                };

                ws.onmessage = (e) => {
                    let arr = JSON.parse(e.data);
                    handleMessage(arr);
                };

                var handleMessage = (arr) => {
                    console.log(arr);
                    let type = arr[0];
                    switch (type) {
                        case 'EVENT':
                            handleEvent(arr);
                            break;
                        default:
                            console.error('Unhandled message type', type);
                            break;
                    }
                };

                var handleEvent = (arr) => {
                    let kind = arr[2].kind;
                    let content = null;
                    switch (kind) {
                        case Kinds.Metadata:
                            content = arr[2].content;
                            let profile = JSON.parse(content);
                            console.log('profile', profile);
                            let elements = [];

                            if (profile.picture)
                                elements.push($('<img/>', {'class': 'profile-picture ms-2', 'src': profile.picture}));

                            elements.push($('<span/>', {'class': 'profile-name ms-2'}).html(profile.name));

                            if (profile.website)
                                elements.push($('<a/>', {'class': 'profile-website ms-2', 'href': profile.website}).html(profile.website));

                            $('.profile', $this).find('.loading').remove();
                            $('.profile', $this).html(elements);
                            break;
                        case Kinds.Text:
                            content = arr[2].content;
                            $('.posts', $this).find('.loading').remove();
                            $('.posts', $this).prepend($('<li/>', {'class': 'list-group-item'}).html(content));
                            break;
                        default:
                            console.error('Unhandled event kind', kind);
                            break;
                    }

                };
            };

            open(state);
        });
    };
})(jQuery);