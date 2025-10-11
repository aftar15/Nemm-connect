PS C:\Users\Engr. John Rome\Desktop\Mas-convention\nemm-connect\load-tests> k6 run critical-flows.js

         /\      Grafana   /‾‾/
    /\  /  \     |\  __   /  /
   /  \/    \    | |/ /  /   ‾‾\
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/

     execution: local
        script: critical-flows.js
        output: -

     scenarios: (100.00%) 1 scenario, 500 max VUs, 15m30s max duration (incl. graceful stop):
              * default: Up to 500 looping VUs for 15m0s over 5 stages (gracefulRampDown: 30s, gracefulStop: 30s)


 ✓ checks.........................: NaN%
 ✓ data_received.................: 1300.81 MB
 ✓ data_sent.....................: 20106.35 KB
 ✓ http_req_duration.............: avg=182.15ms min=0.00ms med=125.35ms max=2680.14ms p(95)=627.94ms
 ✓ http_req_failed...............: 0.00%
 ✓ http_reqs.....................: 201852 requests
 ✓ iteration_duration............: avg=10277.17ms
 ✓ iterations....................: 28836
 ✓ vus...........................: 1 (max: 500)

running (15m05.7s), 000/500 VUs, 28836 complete and 0 interrupted iterations
default ✓ [======================================] 000/500 VUs  15m0s
ERRO[0906] thresholds on metrics 'errors' have been crossed