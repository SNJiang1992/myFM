let EventCenter = {
    on(type,handler){
        $(document).on(type,handler)
    },
    fire(type,data){
        $(document).trigger(type,data)
    }
}

let Footer = {
    init(){
        this.$footer = $('footer')
        this.render()
    },
    bind:()=>{
        $(window).resize(function () {
            console.log(this)
            this.setStyle()
        })
    },
    render(){
        let _this = this
        $.getJSON('http://api.jirengu.com/fm/getChannels.php')
            .done( (ret)=> {
                _this.renderFooter(ret.channels)
            }).fail(function () {
            console.log('error')
        })
    },
    renderFooter(channels){
        console.log(channels)
        let html = ''
        channels.forEach(function (channel) {
            html+=`<li data-channel-id="${channel.channel_id}">
                    <div class="cover" style="background-image:url(${channel.cover_small})"></div>
                    <h3>${channel.name}</h3>
                    </li>`
        })
        this.$footer.find('ul').html(html)
        this.setStyle()
    },
    setStyle(){
        let count = this.$footer.find('li').length
        let width = this.$footer.find('li').outerWidth(true)
        this.$footer.find('ul').css({
            width:count*width+'px'
        })
    }
}

Footer.init()