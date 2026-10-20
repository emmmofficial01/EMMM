#!/usr/bin/env python3
"""Fetch public Google News RSS search results. Candidates only; never auto-publish."""
import json,urllib.parse,urllib.request,xml.etree.ElementTree as ET,datetime,html,re,pathlib
ROOT=pathlib.Path(__file__).parent
queries={
 "EMMM": '"Emmm" afrofusion singer Barrie',
 "EMMMPIRE": '"Emmmpire" Barrie events',
 "EMMM’S CRIB": '"Emmm’s Crib" music OR "Emmms Crib"',
}
items=[]; seen=set()
for brand,query in queries.items():
 url='https://news.google.com/rss/search?q='+urllib.parse.quote(query)+'&hl=en-CA&gl=CA&ceid=CA:en'
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'EMMM website news review bot/1.0'})
  with urllib.request.urlopen(req,timeout=25) as r: data=r.read(1500000)
  channel=ET.fromstring(data)
  for node in channel.findall('./channel/item')[:20]:
   title=html.unescape(node.findtext('title') or '').strip(); link=(node.findtext('link') or '').strip()
   if not title or not link or link in seen:continue
   seen.add(link)
   items.append({'brand':brand,'title':title,'summary':'Search result — verify this is about the correct EMMM brand before publishing.','url':link,'published':node.findtext('pubDate') or '', 'approved':False})
 except Exception as exc:print('Could not retrieve',brand,':',exc)
(ROOT/'news-candidates.json').write_text(json.dumps({'generated_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'items':items},indent=2,ensure_ascii=False)+'\n')
print('Saved',len(items),'unapproved candidates')
