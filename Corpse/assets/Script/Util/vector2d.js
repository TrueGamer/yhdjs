/**
 * 二维向量
 */
var Vector2d = cc.Class({
	ctor( x, y ){
        this.x = x;
        this.y = y;
	},
	
	// 向量加法
	add( vector ) {
        return new Vector2d( this.x + vector.x, this.y + vector.y );
	},
	
    // 向量减法
    sub( vector ) {
        return new Vector2d( this.x - vector.x, this.y - vector.y );
    },

    // 向量点积
    dotProduct( vector ) {
        return this.x * vector.x + this.y * vector.y;
    },

    // 向量取反
    negate() {
        return new Vector2d(-this.x, -this.y);
    },

    // 向量模
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    // 单位向量
    normalize() {
        var length = this.length();
        return new Vector2d(this.x / length, this.y / length);
    },

    // 向量放缩
    scale( scale ) {
        return new Vector2d(this.x * scale, this.y * scale);
    },

    // 向量旋转
    rotate( angle ) {
        var x = this.x;
        var y = this.y;

        var x1 = x * Math.cos(angle) - y * Math.sin(angle);
        var y1 = x * Math.sin(angle) + y * Math.cos(angle);

        return new Vector2d(x1, y1);
    },
});

if(typeof module !== 'undefined'){
	module.exports = Vector2d;
}