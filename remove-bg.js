const { Jimp } = require('jimp');

Jimp.read('assets/mens_clothing.png')
    .then(image => {
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const red = this.bitmap.data[idx + 0];
            const green = this.bitmap.data[idx + 1];
            const blue = this.bitmap.data[idx + 2];

            if (red > 240 && green > 240 && blue > 240) {
                // Set alpha to 0 for white/near-white pixels
                this.bitmap.data[idx + 3] = 0;
            }
        });

        return image.write('assets/mens_clothing.png');
    })
    .catch(err => {
        console.error(err);
    });
