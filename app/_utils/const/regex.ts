export class CRegex {
    static readonly PHONE_REGEX = /^(\+62|62|0)[8][1-9][0-9]{6,11}$/;
    static readonly BAN_DURATION_REGEX = /^(\d+(ns|us|µs|ms|s|m|h)|none)$/;
    static readonly FORMAT_ID_YEAR_SEQUENCE = /(\d{4})(?=-\d{4}$)/;
    static readonly FORMAT_ID_SEQUENCE_END = /(\d{4})$/;
    static readonly FORMAT_ID_SEQUENCE = /(\d{4})(?=-\d{2}$)/;
    static readonly PATROL_UNIT_ID_REGEX = /^PU-(\w{3,})(\d{2})$/;
}
