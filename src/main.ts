import { init, Sprite, GameLoop, TileEngine } from "kontra";

const { canvas } = init();

let tileEngine: TileEngine | null = null;

const img = new Image();
img.src = 'tiles.png';
img.onload = function() {
  tileEngine = TileEngine({
    tilewidth: 32,
    tileheight: 32,

    width: 14,
    height: 12,

    tilesets: [{
      firstgid: 1,
      image: img
    }],

    layers: [{
      name: 'ground',
      data: [ 2,  2,  2,  2,  1,  2,  2,  3,  2,  3,  1,  3,  2,  3,
              1,  2,  2,  2,  2,  3,  2,  2,  2,  2,  1,  3,  1,  2,
              2,  1,  1,  3,  3,  2,  2,  2,  2,  1,  3,  2,  3,  3,
              1,  3,  1,  1,  2,  3,  3,  2,  3,  2,  1,  1,  1,  1,
              2,  2,  3,  1,  2,  2,  2,  1,  3,  3,  2,  3,  3,  2,
              2,  2,  3,  2,  3,  3,  3,  3,  3,  3,  3,  2,  1,  3,
              2,  2,  1,  2,  2,  2,  1,  3,  1,  2,  3,  2,  3,  1,
              3,  2,  2,  2,  2,  2,  1,  2,  2,  1,  2,  2,  1,  2,
              3,  2,  2,  2,  2,  2,  3,  3,  1,  1,  3,  2,  3,  3,
              2,  2,  3,  1,  1,  2,  2,  2,  1,  3,  2,  3,  3,  2,
              2,  2,  2,  2,  3,  2,  2,  2,  2,  1,  2,  3,  1,  1,
              2,  3,  3,  2,  2,  2,  1,  1,  2,  1,  1,  3,  2,  2,
            ]
    }]
  });
}

const resize = () => {
  canvas.width = window.innerWidth - 10;
  canvas.height = window.innerHeight - 10;
};

window.addEventListener("resize", resize, false);
resize();

const sprite = Sprite({
  x: 100,
  y: 80,
  color: "red",
  width: 20,
  height: 40,
  dx: 2,
});

const loop = GameLoop({
  update: function () {
    sprite.update();

    if (sprite.x > canvas.width) {
      sprite.x = -sprite.width;
    }
  },
  render: function () {
    if (tileEngine) {
      tileEngine.render();
    }
    sprite.render();
  },
});

loop.start();
