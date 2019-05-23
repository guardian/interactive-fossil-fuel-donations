import * as d3 from 'd3';
import data from '../../../.data/candidates.json';

const radius = 32;
let width,
    height,
    ctx,
    ease = d3.easeCubicOut,
    timer;

export default {
    init: function() {
        this.loadImages();
        this.bindings();
        this.sortData();
        this.setupCanvas();
    },

    loadImages: function() {
        data.forEach(function(d) {
            let image = new Image();
                image.src = '{{ path }}/assets/' + this.handlise(d.candidate) + '.png';
                image.onload = function() {
                    d.image = image;
                }.bind(this);
        }.bind(this));
    },

    bindings: function() {
        $('.uit-visuals').on('shift', function(e) {
            this.drawCandidates();
        }.bind(this))
    },

    sortData: function() {
        data.sort(function(a, b) {
            var textA = a.candidate.toUpperCase();
            var textB = b.candidate.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
    },

    setupCanvas: function() {
        width = $('.uit-visuals').width();
        height = $('.uit-visuals').height();

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
                    value: radius * 2
                });
            }

            let root = d3.stratify()
                (levels)
                .sum(function(d) { return d.value })
                .sort(function(a, b) { return b.value - a.value });

            let pack = d3.pack()
                .size([width, height])
                .radius(function(d) { return radius })
                .padding(function(d) { return 30 });

            const packed = pack(root);
            let leaves = packed.leaves();

            for (var i in leaves) {
                leaves[i].color = [32, 32, 32];
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
                    value: radius * 2
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
                .radius(function(d) { return radius; })
                .padding(function(d) { return 30; });

            let packedTrue = pack(rootTrue);
            let packedFalse = pack(rootFalse);

            let leaves = packedTrue.leaves();
                leaves = leaves.concat(packedFalse.leaves());

            for (var i in leaves) {
                if (leaves[i].data.parentId === 'false') {
                    leaves[i].y += height / 3;
                }
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
                    value: data[i].total || radius * 2
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
                .padding(function(d) { return 30; });

            let packFalse = d3.pack()
                .size([width, height / 3])
                .radius(function(d) { return radius; })
                .padding(function(d) { return 30; });

            let packedTrue = packTrue(rootTrue);
            let packedFalse = packFalse(rootFalse);

            let leaves = packedTrue.leaves();
                leaves = leaves.concat(packedFalse.leaves());

            for (var i in leaves) {
                if (leaves[i].data.parentId === 'false') {
                    leaves[i].y += height / 1.5;
                    leaves[i].o = 0.3;
                }
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
                    value: focused ? 120 : radius
                })
            }

            let root = d3.stratify()
                (levels)
                .sum(function(d) { return d.value })
                .sort(function(a, b) { return b.value - a.value });

            let pack = d3.pack()
                .size([width, height])
                .radius(function(d) { return d.value })
                .padding(function(d) { return 30 });

            const packed = pack(root);
            let leaves = packed.leaves();

            for (var i in leaves) {
                var focused = highlightedCandidates[activeSlide].includes(leaves[i].id);
                leaves[i].o = focused ? 1 : 0.4;
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
            candidate.sx = candidate.x || width / 2;
            candidate.sy = candidate.y || height / 2;
            candidate.sr = candidate.r || radius;
            candidate.so = candidate.o || 1;
            candidate.sc = candidate.color || [34, 34, 34]
            candidate.tx = positionedData[i].x;
            candidate.ty = positionedData[i].y;
            candidate.tr = positionedData[i].r || radius;
            candidate.to = positionedData[i].o || 1;

            if (positionedData[i].color) {
                candidate.tc = positionedData[i].color
            } else {
                candidate.tc = candidate.pledged ? [61, 181, 64] : [199, 0, 0];
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
                candidate.fill = `rgba(${candidate.color[0]}, ${candidate.color[1]}, ${candidate.color[2]}, ${candidate.o})`
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
                ctx.globalAlpha = d.o;

                ctx.drawImage(d.image, d.x - d.r, d.y - d.r, d.r * 2, d.r * 2);
                ctx.restore();
            }

            ctx.fillStyle = '#222';
            ctx.font = '14px Guardian Sans Web';
            ctx.textAlign = 'center';
            ctx.fillText(d.surname + ' $10210', d.x, d.y + d.r + 15);

        }.bind(this));

        ctx.restore();
    },

    handlise: function(string) {
        if (string) {
            return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ /g, '-').replace('\'', '').toLowerCase();
        }
    }
};
