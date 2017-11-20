let EventCenter = {
    on(type, handler) {
        $(document).on(type, handler)
    },
    fire(type, data) {
        $(document).trigger(type, data)
    }
}

let Footer = {
    init() {
        this.$footer = $('footer')
        this.$ul = this.$footer.find('ul')
        this.$box = this.$footer.find('.box')
        this.$leftBtn = this.$footer.find('.icon-left')
        this.$rightBtn = this.$footer.find('.icon-right')
        this.isToEnd = false
        this.isToStart = true
        this.isAnimate = false
        this.bind()
        this.render()
    },
    bind() {
        let _this = this
        this.$leftBtn.hide()//初始隐藏向前的按钮
        $(window).resize(function () {
            _this.setStyle()
        })

        this.$rightBtn.on('click', function () {
            if (_this.isAnimate) return
            let itemWidth = _this.$box.find('li').outerWidth(true)
            let rowCount = Math.floor(_this.$box.width() / itemWidth)
            if (!_this.isToEnd) {
                _this.isAnimate = true
                _this.$ul.animate({
                    left: `-=${rowCount * itemWidth}`
                }, 400, function () {
                    _this.isAnimate = false
                    _this.isToStart = false
                    _this.$leftBtn.show()
                    if (parseFloat(_this.$box.width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.css('width'))) {
                        _this.isToEnd = true
                        _this.$rightBtn.hide()
                    }
                })
            }
        })

        this.$leftBtn.on('click', function () {
            if (_this.isAnimate) return
            let itemWidth = _this.$box.find('li').outerWidth(true)
            let rowCount = Math.floor(_this.$box.width() / itemWidth)
            if (!_this.isToStart) {
                _this.isAnimate = true
                _this.$ul.animate({
                    left: `+=${rowCount * itemWidth}`
                }, 400, function () {
                    _this.isAnimate = false
                    _this.isToEnd = false
                    _this.$rightBtn.show()
                    if (parseInt(_this.$ul.css('left')) >= 0) {
                        _this.isToStart = true
                        _this.$leftBtn.hide()
                    }
                })
            }
        })

        this.$footer.on('click', 'li', function () {
            $(this).addClass('active').siblings().removeClass('active')
            EventCenter.fire('select-albumn',
                {
                    channelId: $(this).attr('data-channel-id'),
                    channelName: $(this).attr('data-channel-name')
                })
        })

    },
    render() {
        let _this = this
        $.getJSON('//jirenguapi.applinzi.com/fm/getChannels.php')
            .done((ret) => {
                _this.renderFooter(ret.channels)
            }).fail(function () {
            console.log('error')
        })
    },
    renderFooter(channels) {
        let html = ''
        channels.forEach(function (channel) {
            html += `<li data-channel-id="${channel.channel_id}" data-channel-name="${channel.name}">
                    <div class="cover" style="background-image:url(${channel.cover_small})"></div>
                    <h3>${channel.name}</h3>
                    </li>`
        })
        this.$ul.html(html)
        this.setStyle()
    },
    setStyle() {
        let count = this.$footer.find('li').length
        let width = this.$footer.find('li').outerWidth(true)
        this.$ul.css({
            width: `${count * width}px`
        })
    }
}
let Fm = {
    init() {
        this.$container = $('#page-music')
        this.audio = new Audio()
        this.audio.autoplay = true
        this.bind()
    },
    bind() {
        let _this = this
        EventCenter.on('select-albumn', function (e, channelObj) {
            _this.channelId = channelObj.channelId
            _this.channelName = channelObj.channelName
            _this.loadMusic(function () {
                _this.setMusic()
            })
        })

        this.$container.find('.btn-play').on('click', function () {
            let $btn = $(this)
            if ($btn.hasClass('icon-play')) {
                $btn.removeClass('icon-play').addClass('icon-pause')
                $btn.find('img').attr('src', 'imgs/Pause.png')
                _this.audio.play()
            } else {
                $btn.removeClass('icon-pause').addClass('icon-play')
                $btn.find('img').attr('src', 'imgs/Play.png')
                _this.audio.pause()
            }
        })

        this.$container.find('.btn-next').on('click', function () {
            _this.loadMusic()
        })

        this.audio.addEventListener('play', function () {
            clearInterval(_this.statusClock)
            _this.statusClock = setInterval(function () {
                _this.updataStatus()
            }, 1000)
        })

        this.audio.addEventListener('pause', function () {
            clearInterval(_this.statusClock)
        })
    },
    loadMusic(callback) {
        let _this = this
        $.getJSON('//jirenguapi.applinzi.com/fm/getSong.php', {channel: this.channelId})
            .done(function (ret) {
                _this.song = ret['song'][0]
                _this.setMusic()
                _this.loadLyric()
            })
    },

    loadLyric() {
        let _this = this
        $.getJSON('//jirenguapi.applinzi.com/fm/getLyric.php', {sid: this.song.sid}).done(function (ret) {
            let lyric = ret.lyric
            let lyricObj = {}
            lyric.split('\n').forEach(function (line) {
                let times = line.match(/\d{2}:\d{2}/g)//匹配前面的时间部分
                let str = line.replace(/\[.+?\]/g, '')//取出单独的文本
                if (Array.isArray(times)) {
                    times.forEach(function (time) {
                        lyricObj[time] = str
                    })
                }
            })
            _this.lyricObj = lyricObj
        })
    },

    setMusic() {
        this.audio.src = this.song.url
        $('.bg').css('background-image', `url('${this.song.picture}')`)
        this.$container.find('.aside figure').css('background-image', `url('${this.song.picture}')`)
        this.$container.find('.detail h1').text(this.song.title)
        this.$container.find('.detail .author').text(this.song.artist)
        this.$container.find('.tag').text(this.channelName)
        this.$container.find('.btn-play').removeClass('icon-play').addClass('icon-pause')
    },
    updataStatus() {
        let min = Math.floor(this.audio.currentTime / 60)
        let second = Math.floor(this.audio.currentTime % 60) + ''
        second = second.length === 2 ? second : `0${second}`
        this.$container.find('.current-time').text(min + ':' + second)
        this.$container.find('.bar-progress').css('width', this.audio.currentTime / this.audio.duration * 100 + '%')
        let line = this.lyricObj['0' + min + ':' + second]
        if (line) {
            this.$container.find('.lyric p').text(line)
        }
    }
}

Footer.init()
Fm.init()
