seeds:
	docker-compose -f docker-compose.seeds.yaml up
	docker-compose restart devbox

up:
	docker-compose pull
	docker-compose build
	docker-compose up -d
