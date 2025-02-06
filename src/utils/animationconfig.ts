import CallbackBinding from './callbackbinding';


export default interface AnimationConfig {
    start_frame?: number;
    reverse?: boolean;
    anim_scale?: number;
    on_complete?: CallbackBinding;
}