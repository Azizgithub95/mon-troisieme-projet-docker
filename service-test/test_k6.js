import http from 'k6/http';
import { check } from 'k6';

export default function() {
  const res = http.get('http://api:4000');
  check(res, { 'API status is 200': (r) => r.status === 200 });
}
