FROM grafana/k6

COPY test_k6.js /test_k6.js
ENTRYPOINT ["k6", "run", "/test_k6.js"]
