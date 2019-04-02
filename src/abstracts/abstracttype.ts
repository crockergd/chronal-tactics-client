import AbstractSprite from './abstractsprite';
import AbstractText from './abstracttext';
import AbstractButton from './abstractbutton';
import { AbstractCollectionType } from './abstractcollectiontype';

export type AbstractType = AbstractSprite | AbstractText | AbstractButton | AbstractCollectionType;
