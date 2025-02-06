import { Sprite, Stage } from "@pixi/react";
import { BlurFilter } from "pixi.js";
import blurIcon from "../../assets/blur-icon.svg";
import eraseIcon from "../../assets/erase-icon.svg";
import { Image } from "../../models/Image";
import { Button } from "react-bootstrap";
import './CustomSprite.css';

interface CustomSpriteProps {
  image: Image,
  removeImageFn: (uuid: string) => void,
  changeBlurFn: (uuid: string, blur: boolean) => void
}

export const CustomSprite: React.FC<CustomSpriteProps> = ({ image, removeImageFn, changeBlurFn }) => {
  return (
    <div className="grid-item">
      <Stage width={image.imageInfo.width} height={image.imageInfo.height}>
        <Sprite image={image.imageInfo.url} width={image.imageInfo.width} height={image.imageInfo.height} filters={[new BlurFilter(image.imageState.blur)]} />
      </Stage>
      <div className="actions">
        <Button variant="light" onClick={() => changeBlurFn(image.imageInfo.uuid, !image.imageState.blur)}>
          <img src={blurIcon} />
          <span>Blur</span>
        </Button>
        <Button variant="light" onClick={() => removeImageFn(image.imageInfo.uuid)}>
          <img src={eraseIcon} />
          <span>Erase</span>
        </Button>
      </div>
    </div>
  );
};
