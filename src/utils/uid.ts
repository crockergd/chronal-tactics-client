import UIDType from './uidtype';

export default abstract class UID {
    public static next(type: UIDType): string {
        const generated: string = crypto.randomUUID();
        const id: string = `${type}-${generated}`;
        return id;
    }
}