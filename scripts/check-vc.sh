#!/bin/bash

letters="abcdefghijklmnopqrstuvwxyz"
digits="0123456789"
total=260
checked=0

echo "开始查询 vc 后缀 2 字符域名..."

check_domain() {
  local domain="$1"
  result=$(curl -s "http://localhost:5000/api/whois?domain=$domain" 2>/dev/null)
  if echo "$result" | grep -q '"success":true'; then
    if echo "$result" | grep -qi "no match\|not found\|no entries"; then
      echo "AVAILABLE:$domain"
    else
      echo "TAKEN:$domain"
    fi
  else
    echo "TAKEN:$domain"
  fi
}

available=""
taken=""

for digit in $digits; do
  for letter in $letters; do
    domain="${digit}${letter}.vc"
    checked=$((checked + 1))
    
    result=$(curl -s "http://localhost:5000/api/whois?domain=$domain")
    
    if echo "$result" | grep -q '"success":true'; then
      if echo "$result" | grep -qi "no match\|not found\|no entries"; then
        available="$available $domain"
        echo "[$checked/$total] ✅ $domain 可注册"
      else
        taken="$taken $domain"
        echo "[$checked/$total] ❌ $domain 已注册"
      fi
    else
      taken="$taken $domain"
      echo "[$checked/$total] ❌ $domain 查询失败"
    fi
    
    sleep 0.3
  done
done

echo ""
echo "========== 查询结果 =========="
echo "总查询: $total 个"
echo "已注册: $(echo $taken | wc -w) 个"
echo "可注册: $(echo $available | wc -w) 个"
echo ""
echo "可注册的域名:$available"
