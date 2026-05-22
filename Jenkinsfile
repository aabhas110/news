pipeline {
  agent any

  environment {
    CI = 'true'
    AI_DISABLED = 'true'
    NEXT_TELEMETRY_DISABLED = '1'
    DATABASE_URL = 'postgresql://newsforge:newsforge@localhost:5432/newsforge_ci?schema=public'
    NEXTAUTH_SECRET = 'jenkins-test-secret'
    NEXTAUTH_URL = 'http://localhost:3000'
    CRON_SECRET = 'jenkins-cron-secret'
    IMAGE_NAME = 'newsforge:${BUILD_NUMBER}'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'if [ -f package-lock.json ]; then npm ci; else npm install; fi'
      }
    }

    stage('Environment Check') {
      steps {
        sh 'node --version'
        sh 'npm --version'
        sh 'test -f .env && exit 1 || exit 0'
      }
    }

    stage('Prisma Generate') {
      steps {
        sh 'npx prisma generate'
      }
    }

    stage('Lint') {
      steps {
        sh 'npm run lint'
      }
    }

    stage('Type Check') {
      steps {
        sh 'npm run type-check'
      }
    }

    stage('Unit Tests') {
      steps {
        sh 'npm run test'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Docker Build') {
      steps {
        sh 'docker build -t ${IMAGE_NAME} .'
      }
    }

    stage('Smoke Test') {
      steps {
        sh 'docker run -d --name newsforge-postgres -e POSTGRES_USER=newsforge -e POSTGRES_PASSWORD=newsforge -e POSTGRES_DB=newsforge_ci -p 5432:5432 postgres:16-alpine'
        sh 'sleep 15'
        sh 'docker run -d --name newsforge-smoke -p 3000:3000 -e AI_DISABLED=true -e DATABASE_URL=${DATABASE_URL} -e NEXTAUTH_SECRET=${NEXTAUTH_SECRET} -e NEXTAUTH_URL=${NEXTAUTH_URL} ${IMAGE_NAME}'
        sh 'sleep 10'
        sh 'curl -f http://localhost:3000/api/health'
      }
      post {
        always {
          sh 'docker rm -f newsforge-smoke || true'
          sh 'docker rm -f newsforge-postgres || true'
        }
      }
    }

    stage('Archive Artifacts') {
      steps {
        archiveArtifacts artifacts: 'README.md,Jenkinsfile,Dockerfile,docker-compose.yml,package.json,prisma/schema.prisma', fingerprint: true
      }
    }
  }

  post {
    always {
      sh 'docker image rm ${IMAGE_NAME} || true'
      cleanWs()
    }
  }
}
