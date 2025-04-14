module game {
    /**
     * 敏感词屏蔽工具类
     * @author: linzhiliang 
     * @since: 2020-04-11 14:00:00
     */
    export class TextFilterHelper {

        private static gInstance: TextFilterHelper;
        public static get inst(): TextFilterHelper
        {
            let _self = TextFilterHelper;

            if (_self.gInstance === void 0)
            {
                _self.gInstance = new _self();
            }

            return _self.gInstance;
        }

        private gFilterMap: IMap<ITextFilterMap>;

        public init() {
            let _json: string = "";//屏蔽字词库 - RES.getRes('FilterWords_txt');
            let _list: string[] = _json.toLocaleLowerCase().split("|");

            this.gFilterMap = this.createMap(_list);
        }

        /**
         * 创建屏蔽字库网络
         * @param tList 屏蔽字库
         */
        private createMap(tList: string[]) {
            const _tempMap: IMap<ITextFilterMap> = {};
            const _map: IMap<ITextFilterMap> = {};

            let _words: string;
            let _fWords: string;
            let _curWords: string;
            let _curMap: ITextFilterMap;
            let _nextWords: string;
            let _nextMap: ITextFilterMap;

            let _index: number;
            let _length: number;
            let _lastMap: ITextFilterMap;
            let _state: number;

            for (_words of tList)
            {
                _curWords = '';

                for (_index = 0, _length = _words.length; _index < _length; _index++)
                {
                    _curWords += _words[_index];
                    _curMap = _tempMap[_curWords];

                    if (_curMap === void 0)
                    {
                         _curMap = _tempMap[_curWords] = { map: {}, state: 0 };
                    }

                    if (_index + 1 === _length) break;

                    _state = _curMap.state;
                    _nextWords = _curWords + _words[_index + 1];
                    _nextMap = _tempMap[_nextWords];

                    if (_nextMap === void 0)
                    {
                        _nextMap = _tempMap[_nextWords] = { map: {}, state: 0 };
                    }

                    if (_state === 1)
                    {
                        if (_curMap.map === void 0)
                        {
                            _curMap.map = {};
                        }
                        _curMap.state = -1;
                    }

                    _curMap.map[_nextWords] = _nextMap;
                }

                _fWords = _words[0];
                _lastMap = _tempMap[_curWords];
                _state = _lastMap.state;

                _map[_fWords] = _tempMap[_fWords];
                if (_state === 0)
                {
                    _lastMap.state = 1;
                    delete _lastMap.map;
                }
            }

            return _map;
        }

        /**
         * 屏蔽敏感字符
         * @param tText 需要处理的消息
         */
        public textFilter(tText: string) {
            const _map = this.gFilterMap;
            const _cText = tText.toLocaleLowerCase();
            const _words = tText.split('');

            const _list: [ITextFilterMap, Array<number>, string][] = [[{ map: _map, state: 0 }, [], '']];
            const _rMap: IMap<number> = {};

            let _word: string = '';
            let _curWords: string = '';
            let _index: number = NaN;
            let _length: number = NaN;
            let _i: number = NaN;
            let _j: number = NaN;
            let _curMap: ITextFilterMap = _list[0][0];
            let _curState: 0 | 1 | -1 = 0;
            let _cIndexes: number[] = [];
            let _cIndex: number = NaN;
            let _cWords: string = '';

            for (_index = 0, _length = _cText.length; _index < _length; _index++)
            {
                _word = _cText[_index];
                _i = _list.length;

                while (--_i >= 0)
                {
                    [_curMap, _cIndexes, _cWords] = _list[_i];
                    _curWords = _cWords + _word;
                    _curMap = _curMap.map[_curWords];

                    if (_curMap === void 0) continue;

                    _curState = _curMap.state;

                    if (_curState === 1 || _curState === -1)
                    {
                        for (_cIndex of _cIndexes)
                        {
                            _words[_cIndex] = '*';
                        }
                        _words[_index] = '*';
                        _cIndexes.length = 0;
                    }

                    if (_curState === 0 || _curState === -1)
                    {
                        _j = _rMap[_curWords];

                        if (_j === void 0) {
                            _j = _rMap[_curWords] = _list.length;
                        }

                        if (_words[_index] !== '*')
                        {
                            _cIndexes = _cIndexes.concat(_index);
                        }

                        _list[_j] = [_curMap, _cIndexes, _curWords];
                    }
                }
            }

            return _words.join('');
        }

    }
    export interface ITextFilterMap {
        map?: IMap<ITextFilterMap>;
        state: 0 | 1 | -1;
    }
    export interface IMap<T> {
        [k: string]: T,
        [k: number]: T
    }
}