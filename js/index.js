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
            let itemWidth = _this.$box.find('li').outerWidth(true)
            let rowCount = Math.floor(_this.$box.width() / itemWidth)
            if (!_this.isToEnd) {
                _this.$ul.animate({
                    left: `-=${rowCount * itemWidth}`
                }, 400, function () {
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

            let itemWidth = _this.$box.find('li').outerWidth(true)
            let rowCount = Math.floor(_this.$box.width() / itemWidth)
            if (!_this.isToStart) {
                console.log(11111)
                _this.$ul.animate({
                    left: `+=${rowCount * itemWidth}`
                }, 400, function () {
                    _this.isToEnd = false
                    _this.$rightBtn.show()
                    if (parseInt(_this.$ul.css('left')) >= 0) {
                        _this.isToStart = true
                        _this.$leftBtn.hide()
                    }
                })
            }
        })

        this.$footer.on('click','li',function () {
            $(this).addClass('active').
                siblings().removeClass('active')
            EventCenter.fire('select-albumn',$(this).attr('data-channel-id'))
        })

    },
    render() {
        let _this = this
        $.getJSON('http://api.jirengu.com/fm/getChannels.php')
            .done((ret) => {
                _this.renderFooter(ret.channels)
            }).fail(function () {
            console.log('error')
        })
    },
    renderFooter(channels) {
        console.log(channels)
        let html = ''
        channels.forEach(function (channel) {
            html += `<li data-channel-id="${channel.channel_id}">
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

Footer.init()

EventCenter.on('select-albumn',function (e,data) {
    console.log(data)

})