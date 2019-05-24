import * as d3 from 'd3';
import scroll from '../modules/scroll.js';
import data from '../../../.data/candidates.json';

let width,
    height,
    ctx,
    ease = d3.easeCubicOut,
    timer,
    imageCount = data.length,
    loadedCount = 0,
    size,
    radius;

const fontSize = {
    mobile: 12,
    desktop: 16
}

const moneySize = {
    mobile: 20,
    desktop: 28
}

const padding = {
    mobile: 2,
    desktop: 3
}

export default {
    init: function() {
        this.loadImages();
    },

    loadImages: function() {
        data.forEach(function(d) {
            let image = new Image();
                image.src = '{{ path }}/assets/' + this.handlise(d.candidate) + '.png';
                image.onload = function() {
                    d.image = image;
                    this.checkForAllImages();
                }.bind(this);
        }.bind(this));
    },

    checkForAllImages: function() {
        loadedCount++;1

        if (imageCount === loadedCount) {
            this.bindings();
            this.checkForMobile();
            this.sortData();
            this.setupCanvas();
            this.setRadius();
            scroll.init();
        }
    },

    bindings: function() {
        $('.uit-visuals').on('shift', function(e) {
            this.drawCandidates();
        }.bind(this));

        $(window).resize(function() {
            this.setupCanvas();
            this.checkForMobile();
            this.setRadius();
            this.drawCandidates();
        }.bind(this));
    },

    checkForMobile: function() {
        size = $(window).width() < 980 ? 'mobile' : 'desktop';
    },

    sortData: function() {
        data.sort(function(a, b) {
            var textA = a.candidate.toUpperCase();
            var textB = b.candidate.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
    },

    setupCanvas: function() {
        $('.uit-visuals canvas').remove();
        width = size === 'mobile' ? $(window).width() : $('.uit-visuals').width();
        height = size === 'mobile' ? $(window).height() / 4 * 3 : $('.uit-visuals').height();

        const canvas = d3.select('.uit-visuals')
            .append('canvas')
            .attr('width', width)
            .attr('height', height);

        ctx = canvas.node().getContext('2d');
    },

    drawCandidates: function() {
        this.getPositions();
    },

    getPositions: function() {
        let activeSlide = parseInt($('.uit-visuals').attr('data-set'));
        let positions;

        if (activeSlide === 0) {
            let levels = [];
                levels.push({
                    id: 'parent',
                    parentId: null
                });

            for (var i in data) {
                levels.push({
                    id: data[i].candidate,
                    parentId: 'parent',
                    value: 1
                });
            }

            let root = d3.stratify()
                (levels)
                .sum(function(d) { return d.value })
                .sort(function(a, b) { return b.value - a.value });

            let pack = d3.pack()
                .size([width, height])
                .radius(function(d) { return radius })
                .padding(function(d) { return padding[size] });

            const packed = pack(root);
            let leaves = packed.leaves();

            for (var i in leaves) {
                leaves[i].color = [32, 32, 32];
                leaves[i].showFaces = true;
            }

            this.animate(leaves);
        } else if (activeSlide === 1) {
            let levels = {};

            levels.true = [];
            levels.true.push({
                id: 'true',
                parentId: null
            });

            levels.false = [];
            levels.false.push({
                id: 'false',
                parentId: null
            });

            for (var i in data) {
                const pledged = data[i].pledged ? 'true' : 'false';
                levels[pledged].push({
                    id: data[i].candidate,
                    parentId: pledged,
                    value: 1
                });
            }

            let rootTrue = d3.stratify()
                (levels.true)
                .sum(function(d) { return d.value })
                .sort(function(a, b) { return b.value - a.value });

            let rootFalse = d3.stratify()
                (levels.false)
                .sum(function(d) { return d.value })
                .sort(function(a, b) { return b.value - a.value });

            let pack = d3.pack()
                .size([width, height / 1.5])
                .radius(function(d) { return radius })
                .padding(function(d) { return padding[size]; });

            let packedTrue = pack(rootTrue);
            let packedFalse = pack(rootFalse);

            let leaves = packedTrue.leaves();
                leaves = leaves.concat(packedFalse.leaves());

            for (var i in leaves) {
                if (leaves[i].data.parentId === 'false') {
                    leaves[i].y += height / 3;
                }
                leaves[i].labels = true;
            }

            this.animate(leaves);
        } else if (activeSlide === 2) {
            let levels = {};
            levels.true = [];
            levels.true.push({
                id: 'true',
                parentId: null
            });

            levels.false = [];
            levels.false.push({
                id: 'false',
                parentId: null
            });

            for (var i in data) {
                const received = data[i].total ? 'true' : 'false';
                levels[received].push({
                    id: data[i].candidate,
                    parentId: received,
                    value: data[i].total || 1
                });
            }

            let rootTrue = d3.stratify()
                (levels.true)
                .sum(function(d) { return d.value })
                .sort(function(a, b) { return b.value - a.value });

            let rootFalse = d3.stratify()
                (levels.false)
                .sum(function(d) { return d.value })
                .sort(function(a, b) { return b.value - a.value });

            let packTrue = d3.pack()
                .size([width, height / 1.5])
                .padding(function(d) { return padding[size]; });

            let packFalse = d3.pack()
                .size([width, height / 3])
                .radius(function(d) { return radius })
                .padding(function(d) { return padding[size]; });

            let packedTrue = packTrue(rootTrue);
            let packedFalse = packFalse(rootFalse);

            let leaves = packedTrue.leaves();
                leaves = leaves.concat(packedFalse.leaves());

            for (var i in leaves) {
                if (leaves[i].data.parentId === 'false') {
                    leaves[i].y += height / 1.5;
                    leaves[i].blurred = true;
                }
                leaves[i].labels = true;
                leaves[i].money = true;
            }

            this.animate(leaves);
        } else {
            var highlightedCandidates = {
                3: ['Beto O\'Rourke'],
                4: ['Michael Bennet'],
                5: ['Wayne Messam', 'Eric Swalwell']
            }

            let levels = [];
                levels.push({
                    id: 'candidates',
                    parentId: null
                });

            for (var i in data) {
                var focused = highlightedCandidates[activeSlide].includes(data[i].candidate);

                levels.push({
                    id: data[i].candidate,
                    parentId: 'candidates',
                    value: focused ? radius * 3 : radius
                })
            }

            let root = d3.stratify()
                (levels)
                .sum(function(d) { return d.value })
                .sort(function(a, b) { return b.value - a.value });


            let pack = d3.pack()
                .size([width, height])
                .padding(function(d) { return padding[size] });

            const packed = pack(root);
            let leaves = packed.leaves();

            for (var i in leaves) {
                var focused = highlightedCandidates[activeSlide].includes(leaves[i].id);
                leaves[i].blurred = !focused;
                leaves[i].showFaces = focused;
            }

            this.animate(leaves);
        }
    },

    animate: function(positionedData) {
        positionedData.sort(function(a, b) {
            var textA = a.id.toUpperCase();
            var textB = b.id.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });

        data.forEach(function(candidate, i) {
            candidate.money = positionedData[i].money;
            candidate.showFaces = positionedData[i].showFaces;
            candidate.labels = positionedData[i].labels;

            candidate.sx = candidate.x || width / 2;
            candidate.sy = candidate.y || height / 2;
            candidate.sr = candidate.r || radius;
            candidate.so = candidate.o || 1;
            candidate.sc = candidate.color || [34, 34, 34]
            candidate.tx = positionedData[i].x;
            candidate.ty = positionedData[i].y;
            candidate.tr = positionedData[i].r || radius;
            candidate.to = candidate.showFaces ? 1 : 0.2;


            if (positionedData[i].color) {
                candidate.tc = positionedData[i].color
            } else {
                if (positionedData[i].blurred) {
                    candidate.tc = candidate.pledged ? [171, 223, 173] : [231, 145, 145];
                } else {
                    candidate.tc = candidate.pledged ? [61, 181, 64] : [199, 0, 0];
                }
            }
        }.bind(this));

        if (timer !== undefined) {
            timer.stop();
        }

        timer = d3.timer(function(elapsed) {
            var t = Math.min(1, ease(elapsed / 800));
            data.forEach(function(candidate, i) {
                candidate.x = candidate.sx * (1 - t) + candidate.tx * t;
                candidate.y = candidate.sy * (1 - t) + candidate.ty * t;
                candidate.r = candidate.sr * (1 - t) + candidate.tr * t;
                candidate.o = candidate.so * (1 - t) + candidate.to * t;
                candidate.color = [];
                candidate.color[0] = candidate.sc[0] * (1 - t) + candidate.tc[0] * t;
                candidate.color[1] = candidate.sc[1] * (1 - t) + candidate.tc[1] * t;
                candidate.color[2] = candidate.sc[2] * (1 - t) + candidate.tc[2] * t;
                candidate.fill = `rgb(${candidate.color[0]}, ${candidate.color[1]}, ${candidate.color[2]})`
            });

            this.draw();

            if (t === 1) {
                timer.stop();
            }
        }.bind(this), 0)
    },

    draw: function() {
        ctx.clearRect(0, 0, width, height);
        ctx.save();

        data.forEach(function(d) {
            ctx.fillStyle = d.fill;
            ctx.beginPath();
            ctx.moveTo(d.x + d.r, d.y);
            ctx.arc(d.x, d.y, d.r, 0, 2 * Math.PI, true);
            ctx.fill();

            if (d.image) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.r, 0, 2 * Math.PI, true);
                ctx.closePath();
                ctx.clip();
                ctx.globalAlpha = d.o

                ctx.drawImage(d.image, d.x - d.r, d.y - d.r, d.r * 2, d.r * 2);
                ctx.restore();
            }

            if (d.labels) {
                ctx.fillStyle = '#fff';
                ctx.font = `${fontSize[size]}px Guardian Sans Web`;
                ctx.textAlign = 'center';
                ctx.fillText(d.surname, d.x, d.y + (fontSize[size] / 2) - (d.money ? fontSize[size] : 0) );
            }
            if (d.labels && d.money) {
                ctx.font = `${moneySize[size]}px Guardian Figures`;
                ctx.fillText(this.formatMoney(d.total), d.x, d.y + (moneySize[size] / 1.5))
            }
        }.bind(this));

        ctx.restore();
    },

    formatMoney: function(number) {
        if (!number) {
            return '$0';
        } else {
            var figureCount = number.toString().length;

            if (figureCount >= 4) {
                return '$' + Math.round(number / 1000) + 'k';
            } else {
                return '$' + number;
            }
        }
    },

    handlise: function(string) {
        if (string) {
            return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ /g, '-').replace('\'', '').toLowerCase();
        }
    },

    setRadius: function() {
        let levels = [];
            levels.push({
                id: 'parent',
                parentId: null
            });

        for (var i in data) {
            levels.push({
                id: data[i].candidate,
                parentId: 'parent',
                value: 1
            });
        }

        let root = d3.stratify()
            (levels)
            .sum(function(d) { return d.value })
            .sort(function(a, b) { return b.value - a.value });

        let pack = d3.pack()
            .size([width, height])
            .padding(function(d) { return padding[size] });

        const packed = pack(root);
        let leaves = packed.leaves();

        radius = leaves[0].r;
    }
};
