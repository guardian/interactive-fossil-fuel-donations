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
    radius,
    padding,
    fontSize,
    moneyFontSize;

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
        loadedCount++;

        if (imageCount === loadedCount) {
            this.bindings();
            this.sortData();
            this.setupCanvas();
            this.setValues();
            scroll.init();
        }
    },

    bindings: function() {
        $('.uit-visuals').on('shift', function(e) {
            this.drawCandidates();
        }.bind(this));

        $(window).resize(function() {
            this.setupCanvas();
            this.setValues();
            this.drawCandidates();
        }.bind(this));
    },

    setValues: function() {
        padding = Math.floor(width * 0.007);
        fontSize = Math.floor(width * 0.025);
        moneyFontSize = Math.floor(width * 0.045);
        radius = Math.floor(width * 0.07);
    },

    sortData: function() {
        data.sort(function(a, b) {
            return b.total - a.total
        });
    },

    setupCanvas: function() {
        $('.uit-visuals canvas').remove();
        width = $('.uit-visuals').width();
        height = $('.uit-visuals').width() * 1.5;

        function gcd (a, b) {
          return (b == 0) ? a : gcd (b, a%b);
        }

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
                if (data[i].candidate !== 'Donald Trump') {
                    levels.push({
                        id: data[i].candidate,
                        parentId: 'parent',
                        value: 1
                    });
                }
            }

            let root = d3.stratify()
                (levels)
                .sum(function(d) { return d.value })
                .sort(function(a, b) { return b.value - a.value });

            let pack = d3.pack()
                .size([width, height])
                .radius(function(d) { return radius })
                .padding(function(d) { return padding });

            const packed = pack(root);
            let leaves = packed.leaves();

            for (var i in leaves) {
                leaves[i].color = [32, 32, 32];
                leaves[i].showFaces = true;
            }

            this.animate(leaves);
        } else if (activeSlide === 1 || activeSlide === 2) {
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
                if (data[i].candidate !== 'Donald Trump') {
                    const pledged = data[i].pledged ? 'true' : 'false';
                    levels[pledged].push({
                        id: data[i].candidate,
                        parentId: pledged,
                        value: 1
                    });
                }
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
                .padding(function(d) { return padding; });

            let packedTrue = pack(rootTrue);
            let packedFalse = pack(rootFalse);

            let leaves = packedTrue.leaves();
                leaves = leaves.concat(packedFalse.leaves());

            for (var i in leaves) {
                if (leaves[i].data.parentId === 'false') {
                    leaves[i].y += height / 3;
                }
                if (activeSlide === 2) {
                    if (leaves[i].id !== 'Joe Biden' && leaves[i].id !== 'Kamala Harris' && leaves[i].id !== 'Bill De Blasio') {
                        leaves[i].blurred = true;
                    }
                }
                leaves[i].labels = true;
            }

            this.animate(leaves);
        } else {
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
                if (activeSlide === 7) {
                    const received = data[i].total ? 'true' : 'false';
                    levels[received].push({
                        id: data[i].candidate,
                        parentId: received,
                        value: data[i].total || 1
                    });
                } else if (data[i].candidate !== 'Donald Trump') {
                    const received = data[i].total ? 'true' : 'false';
                    levels[received].push({
                        id: data[i].candidate,
                        parentId: received,
                        value: data[i].total || 1
                    });
                }
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
                .size([width * 0.9, height / 3 * 2])
                .padding(function(d) { return padding; });

            let packFalse = d3.pack()
                .size([width * 0.9, height / 3])
                .radius(function(d) { return radius })
                .padding(function(d) { return padding; });

            let packedTrue = packTrue(rootTrue);
            let packedFalse = packFalse(rootFalse);

            let leaves = packedTrue.leaves();
                leaves = leaves.concat(packedFalse.leaves());

            var highlightedCandidates = {
                4: ['Beto O\'Rourke'],
                5: ['Michael Bennet'],
                6: ['Kirsten Gillibrand', 'Bernie Sanders']
            }

            var activeSlidesHighlights = highlightedCandidates[activeSlide];

            for (var i in leaves) {
                if (leaves[i].data.parentId === 'false') {
                    leaves[i].y += height / 1.5;
                    leaves[i].blurred = true;
                }

                leaves[i].x += width * 0.05;

                if (activeSlidesHighlights) {
                    var focused = highlightedCandidates[activeSlide].includes(leaves[i].id);
                    leaves[i].blurred = !focused;
                    leaves[i].showFaces = focused;
                    leaves[i].labels = !focused;
                    leaves[i].money = !focused;
                } else {
                    leaves[i].labels = true;
                    leaves[i].money = true;
                }
            }

            this.animate(leaves, activeSlide);
        }
    },

    animate: function(positionedData, activeSlide = null) {
        var newPositionedData = {};

        positionedData.forEach(function(candidate, i) {
            newPositionedData[candidate.id] = candidate;
        });

        data.forEach(function(candidate, i) {
            if (newPositionedData[candidate.candidate]) {
                var positionedCandidate = newPositionedData[candidate.candidate];

                candidate.money = positionedCandidate.money;
                candidate.showFaces = positionedCandidate.showFaces;
                candidate.labels = positionedCandidate.labels;

                candidate.sx = candidate.x || width / 2;
                candidate.sy = candidate.y || height / 2;
                candidate.sr = candidate.r || radius;
                candidate.so = candidate.o || 1;
                candidate.sc = candidate.color || [34, 34, 34]
                candidate.tx = positionedCandidate.x;
                candidate.ty = positionedCandidate.y;
                candidate.tr = positionedCandidate.r || radius;
                candidate.to = candidate.showFaces ? 1 : 0.2;

                if (candidate.money && candidate.labels && candidate.tr < (width / 17)) {
                    candidate.offsetLabel = true;

                    var dy = candidate.ty - (height / 3);
                    var dx = candidate.tx - (width / 2);
                    var theta = Math.atan2(dy, dx);
                    candidate.offsetY = candidate.ty + Math.sin(theta) * (width * 0.09);
                    candidate.offsetX = candidate.tx + Math.cos(theta) * (width * 0.09);

                    if (activeSlide && activeSlide < 7) {
                        if (candidate.candidate === 'Seth Moulton') {
                            candidate.offsetY += width * 0.04;
                            candidate.offsetX += width * 0.01;
                        } else if (candidate.candidate === 'Pete Buttigieg') {
                            candidate.offsetY += width * 0.05;
                        } else if (candidate.candidate === 'Mike Gravel') {
                            candidate.offsetY -= width * 0.05;
                        } else if (candidate.candidate === 'Cory Booker') {
                            candidate.offsetY += width * 0.04;
                            candidate.offsetX += width * 0.05;
                        } else if (candidate.candidate === 'Julian Castro') {
                            candidate.offsetY -= width * 0.01;
                            candidate.offsetX -= width * 0.04;
                        } else if (candidate.candidate === 'John Delaney') {
                            candidate.offsetY -= width * 0.04;
                            candidate.offsetX += width * 0.01;
                        } else if (candidate.candidate === 'Kamala Harris') {
                            candidate.offsetX -= width * 0.03;
                        } else if (candidate.candidate === 'Tulsi Gabbard') {
                            candidate.offsetY += width * 0.03;
                            candidate.offsetX += width * 0.05;
                        } else if (candidate.candidate === 'Andrew Yang') {
                            candidate.offsetY += width * 0.01;
                            candidate.offsetX += width * 0.04;
                        }
                    } else if (activeSlide === 7) {
                        if (candidate.candidate === 'Cory Booker') {
                            candidate.offsetY += width * 0.01;
                            candidate.offsetX += width * 0.05;
                        } else if (candidate.candidate === 'Jay Inslee') {
                            candidate.offsetY -= width * 0.02;
                        } else if (candidate.candidate === 'Andrew Yang') {
                            candidate.offsetY -= width * 0.02;
                            candidate.offsetX -= width * 0.03;
                        } else if (candidate.candidate === 'Julian Castro') {
                            candidate.offsetY -= width * 0.03;
                            candidate.offsetX -= width * 0.01;
                        } else if (candidate.candidate === 'Mike Gravel') {
                            candidate.offsetY += width * 0.04;
                            candidate.offsetX -= width * 0.02;
                        } else if (candidate.candidate === 'Pete Buttigieg') {
                            candidate.offsetY += width * 0.03;
                            candidate.offsetX += width * 0.03;
                        } else if (candidate.candidate === 'John Delaney') {
                            candidate.offsetY -= width * 0.03;
                            candidate.offsetX -= width * 0.01;
                        }
                    }
                } else {
                    candidate.offsetLabel = false;
                }

                if (positionedCandidate.color) {
                    candidate.tc = positionedCandidate.color
                } else {
                    if (candidate.candidate === 'Donald Trump') {
                        candidate.tc = [32, 32, 32];
                    } else if (positionedCandidate.blurred) {
                        candidate.tc = candidate.pledged ? [171, 223, 173] : [231, 145, 145];
                    } else {
                        candidate.tc = candidate.pledged ? [61, 181, 64] : [199, 0, 0];
                    }
                }
            } else {
                candidate.sx = candidate.x || -width / 2;
                candidate.sy = candidate.y || height / 2;
                candidate.sr = candidate.r || radius;
                candidate.so = candidate.o || 1;
                candidate.sc = candidate.c || [34, 34, 34];
                candidate.tx = -width / 2;
                candidate.ty = height / 2;
                candidate.tr = radius;
                candidate.to = 1;
                candidate.tc = [34, 34, 34];
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
                candidate.fill = `rgb(${candidate.color[0]}, ${candidate.color[1]}, ${candidate.color[2]})`;

                if (candidate.offsetLabel) {
                    if (candidate.lx !== candidate.offsetX && candidate.ly !== candidate.offsetY) {
                        candidate.lx = candidate.sx * (1 - t) + candidate.offsetX * t;
                        candidate.ly = candidate.sy * (1 - t) + candidate.offsetY * t;
                    } else {
                        candidate.lx = candidate.offsetX;
                        candidate.ly = candidate.offsetY;
                    }
                } else {
                    candidate.lx = candidate.x;
                    candidate.ly = candidate.y;
                }
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
                ctx.fillStyle = d.offsetLabel ? '#222' : '#fff';
                ctx.font = `${fontSize}px Guardian Sans Web`;
                ctx.textAlign = 'center';
                ctx.fillText(d.surname, d.lx, d.ly + (fontSize / 2) - (d.money ? fontSize : 0) );

                if (d.money) {
                    ctx.font = `${moneyFontSize}px Guardian Figures`;
                    ctx.fillText(this.formatMoney(d.total), d.lx, d.ly + (moneyFontSize / 1.5));
                }
            }
        }.bind(this));

        ctx.restore();
    },

    formatMoney: function(number) {
        if (!number) {
            return '$0';
        } else {
            var figureCount = number.toString().length;

            if (figureCount >= 7) {
                return '$' + Math.round(number / 1000000) + '.' + Math.round(number / 100000).toString().substr(1) + 'm';
            }
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
    }
};
