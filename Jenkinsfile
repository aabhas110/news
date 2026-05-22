pipeline {
  agent any

  environment {
    CI = 'true'
    AI_DISABLED = 'true'
    NEXT_TELEMETRY_DISABLED = '1'

    NEXTAUTH_SECRET = 'jenkins-test-secret'
    NEXTAUTH_URL = 'http://localhost:3000'
    CRON_SECRET = 'jenkins-cron-secret'
    DATABASE_URL = 'postgresql://newsforge:newsforge@localhost:5432/newsforge_ci?schema=public'

    CI_IMAGE = "newsforge-ci:${BUILD_NUMBER}"
    IMAGE_NAME = "newsforge:${BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/aabhas110/news.git'
      }
    }

    stage('Check Workspace Files') {
      steps {
        sh '''
          echo "Workspace:"
          pwd
          echo "Files:"
          ls -la
          echo "package.json:"
          test -f package.json
          echo "Dockerfile.ci:"
          test -f Dockerfile.ci
        '''
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'docker build -f Dockerfile.ci --target deps -t "$CI_IMAGE-deps" .'
      }
    }

    stage('Environment Check') {
      steps {
        sh '''
          docker version
          docker build -f Dockerfile.ci --target source -t "$CI_IMAGE-source" .
        '''
      }
    }

    stage('Prisma Generate') {
      steps {
        sh 'docker build -f Dockerfile.ci --target prisma -t "$CI_IMAGE-prisma" .'
      }
    }

    stage('Lint') {
      steps {
        sh 'docker build -f Dockerfile.ci --target lint -t "$CI_IMAGE-lint" .'
      }
    }

    stage('Type Check') {
      steps {
        sh 'docker build -f Dockerfile.ci --target typecheck -t "$CI_IMAGE-typecheck" .'
      }
    }

    stage('Unit Tests') {
      steps {
        sh 'docker build -f Dockerfile.ci --target test -t "$CI_IMAGE-test" .'
      }
    }

    stage('Build') {
      steps {
        sh 'docker build -f Dockerfile.ci --target build -t "$CI_IMAGE-build" .'
      }
    }

    stage('Docker Build') {
      steps {
        sh 'docker build -t "$IMAGE_NAME" .'
      }
    }

    stage('Smoke Test') {
      steps {
        sh '''
          docker rm -f newsforge-postgres newsforge-smoke || true
          docker network rm newsforge-smoke-net || true
          docker network create newsforge-smoke-net

          docker run -d \
            --network newsforge-smoke-net \
            --name newsforge-postgres \
            -e POSTGRES_USER=newsforge \
            -e POSTGRES_PASSWORD=newsforge \
            -e POSTGRES_DB=newsforge_ci \
            postgres:16

          for i in $(seq 1 30); do
            if docker exec newsforge-postgres pg_isready -U newsforge -d newsforge_ci; then
              break
            fi
            sleep 2
          done

          docker run -d \
            --network newsforge-smoke-net \
            --name newsforge-smoke \
            -p 3000:3000 \
            -e AI_DISABLED=true \
            -e DATABASE_URL="postgresql://newsforge:newsforge@newsforge-postgres:5432/newsforge_ci?schema=public" \
            -e NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
            -e NEXTAUTH_URL="$NEXTAUTH_URL" \
            -e CRON_SECRET="$CRON_SECRET" \
            "$IMAGE_NAME"

          sleep 5
          docker exec newsforge-smoke npx prisma migrate deploy

          for i in $(seq 1 30); do
            if curl -fsS http://localhost:3000/api/health; then
              exit 0
            fi
            echo "Waiting for app health check..."
            docker logs --tail 80 newsforge-smoke || true
            sleep 3
          done

          echo "Smoke test failed. Final app logs:"
          docker logs newsforge-smoke || true
          exit 1
        '''
      }
      post {
        always {
          sh 'docker rm -f newsforge-smoke newsforge-postgres || true'
          sh 'docker network rm newsforge-smoke-net || true'
        }
      }
    }

    stage('Archive Artifacts') {
      steps {
        archiveArtifacts artifacts: 'README.md,Jenkinsfile,Dockerfile,Dockerfile.ci,docker-compose.yml,package.json,prisma/schema.prisma', fingerprint: true
      }
    }
  }

  post {
    always {
      sh '''
        docker image rm "$IMAGE_NAME" || true
        docker image rm "$CI_IMAGE-deps" "$CI_IMAGE-source" "$CI_IMAGE-prisma" "$CI_IMAGE-lint" "$CI_IMAGE-typecheck" "$CI_IMAGE-test" "$CI_IMAGE-build" || true
      '''
      cleanWs()
    }

    success {
      echo 'Pipeline completed successfully.'
    }

    failure {
      echo 'Pipeline failed. Check logs above.'
    }
  }
}
