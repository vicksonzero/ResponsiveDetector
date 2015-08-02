module.exports = (function() {

    return function(RGBcolor){
        var xyz = RGBtoXYZ(RGBcolor.r, RGBcolor.g, RGBcolor.b);
        var lab = XYZtoLAB(xyz[0], xyz[1], xyz[2]);
        return {
            L: lab[0],
            a: lab[1],
            b: lab[2]
        };
    }
    function RGBtoXYZ(R, G, B)
    {
        var_R = parseFloat( R / 255 );        //R from 0 to 255
        var_G = parseFloat( G / 255 );        //G from 0 to 255
        var_B = parseFloat( B / 255 );        //B from 0 to 255

        if ( var_R > 0.04045 ) var_R = Math.pow(( ( var_R + 0.055 ) / 1.055 ), 2.4);
        else                   var_R = var_R / 12.92;
        if ( var_G > 0.04045 ) var_G = Math.pow(( ( var_G + 0.055 ) / 1.055 ), 2.4);
        else                   var_G = var_G / 12.92;
        if ( var_B > 0.04045 ) var_B = Math.pow(( ( var_B + 0.055 ) / 1.055 ), 2.4);
        else                   var_B = var_B / 12.92;

        var_R = var_R * 100;
        var_G = var_G * 100;
        var_B = var_B * 100;

        //Observer. = 2°, Illuminant = D65
        X = var_R * 0.4124 + var_G * 0.3576 + var_B * 0.1805;
        Y = var_R * 0.2126 + var_G * 0.7152 + var_B * 0.0722;
        Z = var_R * 0.0193 + var_G * 0.1192 + var_B * 0.9505;
        return [X, Y, Z];
    }


    function XYZtoLAB(x, y, z)
    {
        var ref_X =  95.047;
        var ref_Y = 100.000;
        var ref_Z = 108.883;

        var var_X = x / ref_X;          //ref_X =  95.047   Observer= 2°, Illuminant= D65
        var var_Y = y / ref_Y;          //ref_Y = 100.000
        var var_Z = z / ref_Z;          //ref_Z = 108.883

        if ( var_X > 0.008856 ) var_X = Math.pow(var_X, 1/3);
        else                    var_X = ( 7.787 * var_X ) + ( 16 / 116 );

        if ( var_Y > 0.008856 ) var_Y = Math.pow(var_Y, 1/3);
        else                    var_Y = ( 7.787 * var_Y ) + ( 16 / 116 );

        if ( var_Z > 0.008856 ) var_Z = Math.pow(var_Z, 1/3);
        else                    var_Z = ( 7.787 * var_Z ) + ( 16 / 116 );

        var CIE_L = ( 116 * var_Y ) - 16;
        var CIE_a = 500 * ( var_X - var_Y );
        var CIE_b = 200 * ( var_Y - var_Z );

        return [CIE_L, CIE_a, CIE_b];
    }


}());
