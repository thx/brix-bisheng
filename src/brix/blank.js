/* global define */
/*
    毛坯 WorkBlank
*/
define(
    [
        './bisheng'
    ],
    function(
        BiSheng
    ) {

        function Blank(data, tpl) {
            this.data = data
            this.tpl = tpl
            this.content = BiSheng.bind(data, tpl)
        }

        return Blank

    }
)