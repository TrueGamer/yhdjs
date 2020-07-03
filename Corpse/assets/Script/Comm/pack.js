var e = String.fromCharCode
, t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
, n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$"
, i = {};
function o(e, t) {
  if (!i[e]) {
      i[e] = {};
      for (var n = 0, o = e.length; n < o; n++)
          i[e][e.charAt(n)] = n
  }
  return i[e][t]
}
var a = {
    compressToBase64: function(e) {
            if (null == e)
                return "";
            var n = a._compress(e, 6, function(e) {
                return t.charAt(e)
            });
            switch (n.length % 4) {
            default:
            case 0:
                return n;
            case 1:
                return n + "===";
            case 2:
                return n + "==";
            case 3:
                return n + "="
            }
        },
        decompressFromBase64: function(e) {
            return null == e ? "" : "" == e ? null : a._decompress(e.length, 32, function(n) {
                return o(t, e.charAt(n))
            })
        },
        compressToUTF16: function(t) {
            return null == t ? "" : a._compress(t, 15, function(t) {
                return e(t + 32)
            }) + " "
        },
        decompressFromUTF16: function(e) {
            return null == e ? "" : "" == e ? null : a._decompress(e.length, 16384, function(t) {
                return e.charCodeAt(t) - 32
            })
        },
        compressToUint8Array: function(e) {
            for (var t = a.compress(e), n = new Uint8Array(2 * t.length), i = 0, o = t.length; i < o; i++) {
                var r = t.charCodeAt(i);
                n[2 * i] = r >>> 8,
                n[2 * i + 1] = r % 256
            }
            return n
        },
        decompressFromUint8Array: function(t) {
            if (null == t)
                return a.decompress(t);
            for (var n = new Array(t.length / 2), i = 0, o = n.length; i < o; i++)
                n[i] = 256 * t[2 * i] + t[2 * i + 1];
            var r = [];
            return n.forEach(function(t) {
                r.push(e(t))
            }),
            a.decompress(r.join(""))
        },
        compressToEncodedURIComponent: function(e) {
            return null == e ? "" : a._compress(e, 6, function(e) {
                return n.charAt(e)
            })
        },
        decompressFromEncodedURIComponent: function(e) {
            return null == e ? "" : "" == e ? null : (e = e.replace(/ /g, "+"),
            a._decompress(e.length, 32, function(t) {
                return o(n, e.charAt(t))
            }))
        },
        compress: function(t) {
            return a._compress(t, 16, function(t) {
                return e(t)
            })
        },
        _compress: function(e, t, n) {
            if (null == e)
                return "";
            var i, o, a, r, s = {}, l = {}, c = "", u = "", h = "", d = 2, p = 3, f = 2, m = [], g = 0, w = 0;
            for (a = 0,
            r = e.length; a < r; a += 1)
                if (c = e.charAt(a),
                Object.prototype.hasOwnProperty.call(s, c) || (s[c] = p++,
                l[c] = !0),
                u = h + c,
                Object.prototype.hasOwnProperty.call(s, u))
                    h = u;
                else {
                    if (Object.prototype.hasOwnProperty.call(l, h)) {
                        if (h.charCodeAt(0) < 256) {
                            for (i = 0; i < f; i++)
                                g <<= 1,
                                w == t - 1 ? (w = 0,
                                m.push(n(g)),
                                g = 0) : w++;
                            for (o = h.charCodeAt(0),
                            i = 0; i < 8; i++)
                                g = g << 1 | 1 & o,
                                w == t - 1 ? (w = 0,
                                m.push(n(g)),
                                g = 0) : w++,
                                o >>= 1
                        } else {
                            for (o = 1,
                            i = 0; i < f; i++)
                                g = g << 1 | o,
                                w == t - 1 ? (w = 0,
                                m.push(n(g)),
                                g = 0) : w++,
                                o = 0;
                            for (o = h.charCodeAt(0),
                            i = 0; i < 16; i++)
                                g = g << 1 | 1 & o,
                                w == t - 1 ? (w = 0,
                                m.push(n(g)),
                                g = 0) : w++,
                                o >>= 1
                        }
                        0 == --d && (d = Math.pow(2, f),
                        f++),
                        delete l[h]
                    } else
                        for (o = s[h],
                        i = 0; i < f; i++)
                            g = g << 1 | 1 & o,
                            w == t - 1 ? (w = 0,
                            m.push(n(g)),
                            g = 0) : w++,
                            o >>= 1;
                    0 == --d && (d = Math.pow(2, f),
                    f++),
                    s[u] = p++,
                    h = String(c)
                }
            if ("" !== h) {
                if (Object.prototype.hasOwnProperty.call(l, h)) {
                    if (h.charCodeAt(0) < 256) {
                        for (i = 0; i < f; i++)
                            g <<= 1,
                            w == t - 1 ? (w = 0,
                            m.push(n(g)),
                            g = 0) : w++;
                        for (o = h.charCodeAt(0),
                        i = 0; i < 8; i++)
                            g = g << 1 | 1 & o,
                            w == t - 1 ? (w = 0,
                            m.push(n(g)),
                            g = 0) : w++,
                            o >>= 1
                    } else {
                        for (o = 1,
                        i = 0; i < f; i++)
                            g = g << 1 | o,
                            w == t - 1 ? (w = 0,
                            m.push(n(g)),
                            g = 0) : w++,
                            o = 0;
                        for (o = h.charCodeAt(0),
                        i = 0; i < 16; i++)
                            g = g << 1 | 1 & o,
                            w == t - 1 ? (w = 0,
                            m.push(n(g)),
                            g = 0) : w++,
                            o >>= 1
                    }
                    0 == --d && (d = Math.pow(2, f),
                    f++),
                    delete l[h]
                } else
                    for (o = s[h],
                    i = 0; i < f; i++)
                        g = g << 1 | 1 & o,
                        w == t - 1 ? (w = 0,
                        m.push(n(g)),
                        g = 0) : w++,
                        o >>= 1;
                0 == --d && (d = Math.pow(2, f),
                f++)
            }
            for (o = 2,
            i = 0; i < f; i++)
                g = g << 1 | 1 & o,
                w == t - 1 ? (w = 0,
                m.push(n(g)),
                g = 0) : w++,
                o >>= 1;
            for (; ; ) {
                if (g <<= 1,
                w == t - 1) {
                    m.push(n(g));
                    break
                }
                w++
            }
            return m.join("")
        },
        decompress: function(e) {
            return null == e ? "" : "" == e ? null : a._decompress(e.length, 32768, function(t) {
                return e.charCodeAt(t)
            })
        },
        _decompress: function(t, n, i) {
            var o, a, r, s, l, c, u, h = [], d = 4, p = 4, f = 3, m = "", g = [], w = {
                val: i(0),
                position: n,
                index: 1
            };
            for (o = 0; o < 3; o += 1)
                h[o] = o;
            for (r = 0,
            l = Math.pow(2, 2),
            c = 1; c != l; )
                s = w.val & w.position,
                w.position >>= 1,
                0 == w.position && (w.position = n,
                w.val = i(w.index++)),
                r |= (s > 0 ? 1 : 0) * c,
                c <<= 1;
            switch (r) {
            case 0:
                for (r = 0,
                l = Math.pow(2, 8),
                c = 1; c != l; )
                    s = w.val & w.position,
                    w.position >>= 1,
                    0 == w.position && (w.position = n,
                    w.val = i(w.index++)),
                    r |= (s > 0 ? 1 : 0) * c,
                    c <<= 1;
                u = e(r);
                break;
            case 1:
                for (r = 0,
                l = Math.pow(2, 16),
                c = 1; c != l; )
                    s = w.val & w.position,
                    w.position >>= 1,
                    0 == w.position && (w.position = n,
                    w.val = i(w.index++)),
                    r |= (s > 0 ? 1 : 0) * c,
                    c <<= 1;
                u = e(r);
                break;
            case 2:
                return ""
            }
            for (h[3] = u,
            a = u,
            g.push(u); ; ) {
                if (w.index > t)
                    return "";
                for (r = 0,
                l = Math.pow(2, f),
                c = 1; c != l; )
                    s = w.val & w.position,
                    w.position >>= 1,
                    0 == w.position && (w.position = n,
                    w.val = i(w.index++)),
                    r |= (s > 0 ? 1 : 0) * c,
                    c <<= 1;
                switch (u = r) {
                case 0:
                    for (r = 0,
                    l = Math.pow(2, 8),
                    c = 1; c != l; )
                        s = w.val & w.position,
                        w.position >>= 1,
                        0 == w.position && (w.position = n,
                        w.val = i(w.index++)),
                        r |= (s > 0 ? 1 : 0) * c,
                        c <<= 1;
                    h[p++] = e(r),
                    u = p - 1,
                    d--;
                    break;
                case 1:
                    for (r = 0,
                    l = Math.pow(2, 16),
                    c = 1; c != l; )
                        s = w.val & w.position,
                        w.position >>= 1,
                        0 == w.position && (w.position = n,
                        w.val = i(w.index++)),
                        r |= (s > 0 ? 1 : 0) * c,
                        c <<= 1;
                    h[p++] = e(r),
                    u = p - 1,
                    d--;
                    break;
                case 2:
                    return g.join("")
                }
                if (0 == d && (d = Math.pow(2, f),
                f++),
                h[u])
                    m = h[u];
                else {
                    if (u !== p)
                        return null;
                    m = a + a.charAt(0)
                }
                g.push(m),
                h[p++] = a + m.charAt(0),
                a = m,
                0 == --d && (d = Math.pow(2, f),
                f++)
            }
        }
    }; 
module.exports = a;
