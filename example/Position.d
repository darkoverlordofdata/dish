class Position {

    double x;
    double y;

    public void Position(double x, double y) {
        self.x = x;
        self.y = y;
    }
    
    public double getX() {
        double x;
        x = self.x;
        return x;
        // return self.x;
    }
    public void setX(double x) {
        self.x = x;
    }
    public double getY() {
        double y;
        y = self.y;
        return y;
        // return self.y;
    }
    public void setY(double y) {
        self.y = y;
    }

}