$.fn.animateRotate = function(endAngle, options, startAngle)
{
    return this.each(function()
    {
        var elem = $(this), rad, costheta, sintheta, matrixValues, noTransform = !('transform' in this.style || 'webkitTransform' in this.style || 'msTransform' in this.style || 'mozTransform' in this.style || 'oTransform' in this.style);
        if(typeof options !== 'object')
        {
            options = {};
        }
        options.step = function(now)
        {
            if(noTransform)
            {
                rad = now * (Math.PI * 2 / 360);
                costheta = Math.cos(rad);
                sintheta = Math.sin(rad);
                matrixValues = 'M11=' + costheta + ', M12=-'+ sintheta +', M21='+ sintheta +', M22='+ costheta;
                elem.css({
                    'filter': 'progid:DXImageTransform.Microsoft.Matrix(sizingMethod=\'auto expand\','+matrixValues+')',
                    '-ms-filter': 'progid:DXImageTransform.Microsoft.Matrix(sizingMethod=\'auto expand\','+matrixValues+')'
                });
            }
            else
            {
                elem.css({
                    //webkitTransform: 'rotate('+now+'deg)',
                    //mozTransform: 'rotate('+now+'deg)',
                    //msTransform: 'rotate('+now+'deg)',
                    //oTransform: 'rotate('+now+'deg)',
                    transform: 'rotate('+now+'deg)'
                });
            }
        };
        if(startAngle)
        {
            $({deg: startAngle}).animate({deg: endAngle}, options);
        }
        else
        {
            elem.animate({deg: endAngle}, options);
        }
    });
};