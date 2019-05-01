import { WhiteBoardItemRecord } from './white-board/record';

export class RootRecord extends quip.apps.RootRecord {
  static getProperties = () => ({
    items: quip.apps.RecordList.Type(WhiteBoardItemRecord)
  });

  static getDefaultProperties = () => ({
    items: []
  })
}
quip.apps.registerClass(RootRecord, "root-record");
